import { Expenses, Month } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { TABLE_FILTER } from "./income";
import { getUserFromSession } from "utils/nextauth";
import { isProcessedExpense } from "components/expenses/ExpensesForm";

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

      const [totalCount, processedExpenses, expenses] = await Promise.all([
        prisma.expenses.count({
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, userId)
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
            ? createPrismaWhereFromFilters(input.filters, userId)
            : { userId, processedExpense: { is: null } },
        }),
      ]);

      const items = [...processedExpenses, ...expenses];

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items };
    },
  })
  .mutation("add-expense", {
    input: z.object({
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
      processOverXDays: z
        .object({ dailyAmount: z.number().min(1), enabled: z.boolean() })
        .optional()
        .nullable(),
    }),
    async resolve({ ctx, input }) {
      const userId = getUserFromSession(ctx).dbUser.id;

      if (input.processOverXDays?.enabled) {
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
    },
  })
  .mutation("edit-expense", {
    input: z.object({
      id: z.string(),
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
      processOverXDays: z
        .object({ dailyAmount: z.number().min(1), enabled: z.boolean() })
        .optional()
        .nullable(),
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
        include: { date: true },
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
    },
  });
