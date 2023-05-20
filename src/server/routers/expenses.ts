import { Month } from "@prisma/client";
import { z } from "zod";
import { prisma } from "utils/prisma";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { TABLE_FILTER } from "./income";
import { getUserFromSession } from "utils/nextauth";
import { t } from "server/trpc";
import { isAuth } from "utils/middlewares";

export const ADD_EXPENSE_INPUT = z.object({
  amount: z.number().min(1),
  year: z.number(),
  month: z.nativeEnum(Month),
  description: z.string().nullable().optional(),
  processOverXDays: z
    .object({ dailyAmount: z.number().min(1), enabled: z.boolean() })
    .optional()
    .nullable(),
});

export const EDIT_EXPENSE_INPUT = ADD_EXPENSE_INPUT.extend({
  id: z.string().min(2),
});

export const expensesRouter = t.router({
  getInfinitelyScrollableExpenses: isAuth
    .input(
      z.object({
        page: z.number(),
        sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional(),
        filters: z.array(TABLE_FILTER).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = input.page * MAX_ITEMS_PER_TABLE;
      const userId = getUserFromSession(ctx).dbUser.id;

      const [totalCount, processedExpenses, expenses] = await Promise.all([
        prisma.expenses.count({
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, {
                userId,
                processedExpense: { is: null },
              })
            : { userId, processedExpense: { is: null } },
        }),
        prisma.processedExpense.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          // orderBy: getOrderByFromInput(input),
          where: { userId },
          include: { date: true, expenses: { include: { date: true } } },
        }),
        prisma.expenses.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          include: { date: true },
          orderBy: getOrderByFromInput(input),
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, {
                userId,
                processedExpense: { is: null },
              })
            : { userId, processedExpense: { is: null } },
        }),
      ]);

      const items = [...processedExpenses, ...expenses];

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items };
    }),
});
