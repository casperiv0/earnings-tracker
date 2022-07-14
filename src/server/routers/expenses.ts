import { Month, Prisma } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { TABLE_FILTER } from "./income";

export const defaultEarningsSelect = Prisma.validator<Prisma.ExpensesSelect>()({
  id: true,
  user: true,
  userId: true,
  date: { select: { month: true, year: true } },
  dateId: true,
  amount: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});

export const expensesRouter = createRouter()
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
        prisma.expenses.count({
          where: input.filters ? createPrismaWhereFromFilters(input.filters) : undefined,
        }),
        prisma.expenses.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          select: defaultEarningsSelect,
          orderBy: getOrderByFromInput(input),
          where: input.filters ? createPrismaWhereFromFilters(input.filters) : undefined,
        }),
      ]);

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items };
    },
  })
  .mutation("add-expense", {
    input: z.object({
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.dbUser!.id;

      const post = await prisma.expenses.create({
        data: {
          amount: input.amount,
          description: input.description,
          date: {
            create: { month: input.month, year: input.year },
          },
          user: { connect: { id: userId } },
        },
        select: defaultEarningsSelect,
      });
      return post;
    },
  })
  .mutation("edit-expense", {
    input: z.object({
      id: z.string(),
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
    }),
    async resolve({ input }) {
      const post = await prisma.expenses.update({
        where: { id: input.id },
        data: {
          amount: input.amount,
          description: input.description,
          date: { update: { month: input.month, year: input.year } },
        },
        select: defaultEarningsSelect,
      });
      return post;
    },
  })
  .mutation("delete-expense", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      await prisma.expenses.delete({ where: { id } });
    },
  });
