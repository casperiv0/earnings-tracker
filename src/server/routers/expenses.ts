import { ExpenseTag, Month } from "@prisma/client";
import { z } from "zod";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { TABLE_FILTER } from "./income";
import { getUserFromSession } from "utils/nextauth";
import { isProcessedExpense } from "components/expenses/ExpensesForm";
import { processOverXDaysHandler } from "utils/expenses/process-over-x-days-handler";
import { t } from "server/trpc";
import { isAuth } from "utils/middlewares";

export const ADD_EXPENSE_INPUT = z.object({
  amount: z.number().min(0.01),
  year: z.number(),
  month: z.nativeEnum(Month),
  day: z.number(),
  description: z.string().nullish(),
  tag: z.nativeEnum(ExpenseTag).nullish(),
  processOverXDays: z
    .object({ dailyAmount: z.number().min(0.01), enabled: z.boolean() })
    .optional()
    .nullable(),
});

export const EDIT_EXPENSE_INPUT = ADD_EXPENSE_INPUT.extend({
  id: z.string().min(2),
});

export const SET_EXPENSES_TAG_INPUT = z.object({
  ids: z.array(z.string()),
  tag: z.nativeEnum(ExpenseTag),
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
  addExpense: isAuth.input(ADD_EXPENSE_INPUT).mutation(async ({ ctx, input }) => {
    const userId = getUserFromSession(ctx).dbUser.id;

    if (input.processOverXDays?.enabled) {
      return processOverXDaysHandler({ input, userId });
    }

    const createdExpense = await prisma.expenses.create({
      data: {
        amount: input.amount,
        description: input.description,
        tag: input.tag,
        date: {
          create: { month: input.month, year: input.year },
        },
        user: { connect: { id: userId } },
      },
    });
    return createdExpense;
  }),
  editExpense: isAuth.input(EDIT_EXPENSE_INPUT).mutation(async ({ ctx, input }) => {
    const userId = getUserFromSession(ctx).dbUser.id;

    const expense =
      (await prisma.expenses.findFirst({
        where: { userId, id: input.id },
      })) ||
      (await prisma.processedExpense.findFirst({
        where: { userId, id: input.id },
      }));

    if (!expense) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (isProcessedExpense(expense)) {
      await prisma.processedExpense.delete({
        where: { id: expense.id },
      });

      return processOverXDaysHandler({ input, userId });
    }

    const updatedExpense = await prisma.expenses.update({
      where: { id: input.id },
      data: {
        tag: input.tag,
        amount: input.amount,
        description: input.description,
        date: { update: { month: input.month, year: input.year } },
      },
      include: { date: true },
    });
    return updatedExpense;
  }),
  setExpensesTag: isAuth.input(SET_EXPENSES_TAG_INPUT).mutation(async ({ ctx, input }) => {
    const userId = getUserFromSession(ctx).dbUser.id;

    await prisma.$transaction(
      input.ids.map((id) =>
        prisma.expenses.update({
          where: { id, userId },
          data: { tag: input.tag },
        }),
      ),
    );

    return true;
  }),
  deleteExpense: isAuth
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserFromSession(ctx).dbUser.id;

      const expense =
        (await prisma.expenses.findFirst({
          where: { userId, id: input.id },
        })) ||
        (await prisma.processedExpense.findFirst({
          where: { userId, id: input.id },
        }));

      if (!expense) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (isProcessedExpense(expense)) {
        await prisma.processedExpense.delete({
          where: { id: expense.id },
        });
      } else {
        await prisma.expenses.delete({ where: { id: input.id } });
      }
    }),
});
