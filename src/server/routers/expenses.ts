import { Month, Prisma } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { TABLE_FILTER } from "./income";
import { getUserFromSession } from "utils/nextauth";

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
    async resolve({ ctx, input }) {
      const skip = input.page * MAX_ITEMS_PER_TABLE;
      const userId = getUserFromSession(ctx).dbUser.id;

      const [totalCount, items] = await Promise.all([
        prisma.expenses.count({
          where: input.filters ? createPrismaWhereFromFilters(input.filters, userId) : { userId },
        }),
        prisma.expenses.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          select: defaultEarningsSelect,
          orderBy: getOrderByFromInput(input),
          where: input.filters ? createPrismaWhereFromFilters(input.filters, userId) : { userId },
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
      const userId = getUserFromSession(ctx).dbUser.id;

      const createdExpense = await prisma.expenses.create({
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
      return createdExpense;
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
    async resolve({ ctx, input }) {
      const userId = getUserFromSession(ctx).dbUser.id;

      await prisma.expenses.findFirstOrThrow({
        where: { userId, id: input.id },
      });

      const updatedExpense = await prisma.expenses.update({
        where: { id: input.id },
        data: {
          amount: input.amount,
          description: input.description,
          date: { update: { month: input.month, year: input.year } },
        },
        select: defaultEarningsSelect,
      });
      return updatedExpense;
    },
  })
  .mutation("delete-expense", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const userId = getUserFromSession(ctx).dbUser.id;

      await prisma.expenses.findFirstOrThrow({
        where: { userId, id: input.id },
      });

      await prisma.expenses.delete({ where: { id: input.id } });
    },
  });
