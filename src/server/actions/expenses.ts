"use server";

import { z } from "zod";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { getUserFromSession } from "utils/nextauth";
import { isProcessedExpense } from "components/expenses/ExpensesForm";
import { processOverXDaysHandler } from "utils/expenses/process-over-x-days-handler";
import { createAction } from "server/trpc";
import { isAuth } from "utils/middlewares";
import { ADD_EXPENSE_INPUT, EDIT_EXPENSE_INPUT } from "../routers/expenses";

export const addExpenseAction = createAction(
  isAuth.input(ADD_EXPENSE_INPUT).mutation(async ({ ctx, input }) => {
    const userId = getUserFromSession(ctx).dbUser.id;

    if (input.processOverXDays?.enabled) {
      return processOverXDaysHandler({ input, userId });
    }

    const createdExpense = await prisma.expenses.create({
      data: {
        amount: input.amount,
        description: input.description,
        date: {
          create: { month: input.month, year: input.year },
        },
        user: { connect: { id: userId } },
      },
    });
    return createdExpense;
  }),
);

export const editExpenseAction = createAction(
  isAuth.input(EDIT_EXPENSE_INPUT).mutation(async ({ ctx, input }) => {
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
        amount: input.amount,
        description: input.description,
        date: { update: { month: input.month, year: input.year } },
      },
      include: { date: true },
    });
    return updatedExpense;
  }),
);

export const deleteExpenseAction = createAction(
  isAuth
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
);
