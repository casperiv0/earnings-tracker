import type { Expenses } from "@prisma/client";
import type { EDIT_EXPENSE_INPUT } from "server/routers/expenses";
import { prisma } from "utils/prisma";
import type { z } from "zod";

interface Options {
  input: z.infer<typeof EDIT_EXPENSE_INPUT>;
  userId: string;
}

export async function processOverXDaysHandler({ input, userId }: Options) {
  if (!input.processOverXDays?.enabled) return null;

  const processedExpense = await prisma.processedExpense.create({
    data: {
      totalAmount: input.amount,
      amountPerDay: input.processOverXDays.dailyAmount,
      description: input.description,
      user: { connect: { id: userId } },
      date: { create: { month: input.month, year: input.year } },
    },
  });

  const amountOfDays = input.amount / input.processOverXDays.dailyAmount; // can be a decimal number
  const amountOfFullDays = Math.floor(amountOfDays); // remove the decimals
  const extraAmount = parseFloat((amountOfDays - Math.floor(amountOfDays)).toFixed(2)); // get the decimals

  const expenses: Expenses[] = [];

  const description = `Processed over ${amountOfFullDays} days. (Parent: ${processedExpense.id})`;

  for (let i = 0; i < amountOfFullDays; i++) {
    const expense = await prisma.expenses.create({
      data: {
        amount: input.processOverXDays.dailyAmount,
        description,
        date: {
          // todo: check if nearing end of month/year and set accordingly
          create: { month: input.month, year: input.year },
        },
        processedExpense: { connect: { id: processedExpense.id } },
        user: { connect: { id: userId } },
      },
    });

    expenses.push(expense);
  }

  if (extraAmount > 0) {
    const lastExpense = await prisma.expenses.create({
      data: {
        amount: input.processOverXDays.dailyAmount * extraAmount,
        description,
        date: { create: { month: input.month, year: input.year } },
        processedExpense: { connect: { id: processedExpense.id } },
        user: { connect: { id: userId } },
      },
    });

    expenses.push(lastExpense);
  }

  return { ...processedExpense, expenses };
}
