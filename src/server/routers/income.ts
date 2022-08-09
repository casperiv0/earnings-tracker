import { IncomeType, Month, Prisma } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { getUserFromSession } from "utils/nextauth";

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

export const TABLE_FILTER = z.object({
  name: z.string(),
  filterType: z.enum(["id", "string", "date", "number", "enum"]),
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
    async resolve({ ctx, input }) {
      const skip = input.page * MAX_ITEMS_PER_TABLE;
      const userId = getUserFromSession(ctx).dbUser.id;

      const [totalCount, items] = await Promise.all([
        prisma.income.count({
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, { userId })
            : undefined,
        }),
        prisma.income.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          select: incomeSelect,
          orderBy: getOrderByFromInput(input),
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, { userId })
            : undefined,
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
      const userId = getUserFromSession(ctx).dbUser.id;

      const createdIncome = await prisma.income.create({
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

      return createdIncome;
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
    async resolve({ ctx, input }) {
      const userId = getUserFromSession(ctx).dbUser.id;

      await prisma.income.findFirstOrThrow({
        where: { userId, id: input.id },
      });

      const updatedIncome = await prisma.income.update({
        where: { id: input.id },
        data: {
          type: input.type,
          amount: input.amount,
          description: input.description,
          date: { update: { month: input.month, year: input.year } },
        },
        select: incomeSelect,
      });

      return updatedIncome;
    },
  })
  .mutation("delete-income", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      const userId = getUserFromSession(ctx).dbUser.id;

      await prisma.income.findFirstOrThrow({
        where: { userId, id: input.id },
      });

      await prisma.income.delete({ where: { id: input.id } });
    },
  });
