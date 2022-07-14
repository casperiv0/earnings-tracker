import { IncomeType, Month, Prisma } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { getOrderByFromInput } from "utils/utils";

export const incomeSelect = Prisma.validator<Prisma.IncomeSelect>()({
  id: true,
  type: true,
  user: true,
  userId: true,
  date: true,
  dateId: true,
  amount: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});

const TABLE_FILTER = z.object({
  name: z.string(),
  filterType: z.enum(["string", "date", "number", "enum"]),
  content: z.string().or(z.number()).optional(),
  type: z.enum(["equals", "contains", "lt", "gt"]).optional(),
  options: z.array(z.string()).optional(),
});

export const incomeRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("all-infinite", {
    input: z.object({
      page: z.number(),
      sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional(),
      filters: z.array(TABLE_FILTER).optional(),
    }),
    async resolve({ input }) {
      const skip = input.page * MAX_ITEMS_PER_TABLE;

      const [totalCount, items] = await Promise.all([
        prisma.income.count({
          where: input.filters ? makeWhereFromFilters(input.filters) : undefined,
        }),
        prisma.income.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          select: incomeSelect,
          orderBy: getOrderByFromInput(input),
          where: input.filters ? makeWhereFromFilters(input.filters) : undefined,
        }),
      ]);

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items };
    },
  })
  .mutation("add-income", {
    input: z.object({
      type: z.nativeEnum(IncomeType),
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.dbUser!.id;

      const post = await prisma.income.create({
        data: {
          type: input.type,
          amount: input.amount,
          description: input.description,
          date: {
            create: { month: input.month, year: input.year },
          },
          user: { connect: { id: userId } },
        },
        select: incomeSelect,
      });

      return post;
    },
  })
  .mutation("edit-income", {
    input: z.object({
      id: z.string(),
      type: z.nativeEnum(IncomeType),
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
    }),
    async resolve({ input }) {
      const post = await prisma.income.update({
        where: { id: input.id },
        data: {
          type: input.type,
          amount: input.amount,
          description: input.description,
          date: { update: { month: input.month, year: input.year } },
        },
        select: incomeSelect,
      });

      return post;
    },
  })
  .mutation("bulk-update-type", {
    input: z.object({
      type: z.nativeEnum(IncomeType),
      ids: z.array(z.string()),
    }),
    async resolve({ input }) {
      await prisma.$transaction(
        input.ids.map((id) =>
          prisma.income.update({
            where: { id },
            data: { type: input.type },
          }),
        ),
      );
    },
  })
  .mutation("delete-income", {
    input: z.object({ id: z.string() }),
    async resolve({ input }) {
      await prisma.income.delete({ where: { id: input.id } });
    },
  });

// todo: make utils function
function makeWhereFromFilters(filters: z.infer<typeof TABLE_FILTER>[]) {
  const andClause = [];

  for (const filter of filters) {
    if (!filter.type || !filter.content) continue;

    const useDateObj = ["month", "year"].includes(filter.name);

    andClause.push(
      useDateObj
        ? { date: { [filter.name]: { [filter.type]: filter.content } } }
        : { [filter.name]: { [filter.type]: filter.content } },
    );
  }

  return { AND: andClause };
}
