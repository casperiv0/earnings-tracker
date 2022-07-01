import { Month, Prisma } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "server/prisma";
import { TRPCError } from "@trpc/server";

const defaultEarningsSelect = Prisma.validator<Prisma.ExpensesSelect>()({
  id: true,
  user: true,
  userId: true,
  date: true,
  dateId: true,
  amount: true,
});

export const expensesRouter = createRouter()
  .query("all-infinite", {
    async resolve() {
      const items = await prisma.expenses.findMany({
        orderBy: {
          date: { month: "desc" },
        },
      });

      return items;
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
      const userId = ctx.dbUser?.id;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
  .mutation("edit", {
    input: z.object({
      id: z.string().uuid(),
      data: z.object({
        title: z.string().min(1).max(32).optional(),
        text: z.string().min(1).optional(),
      }),
    }),
    async resolve({ input }) {
      const { id, data } = input;
      const post = await prisma.earningEntry.update({
        where: { id },
        data,
        select: defaultEarningsSelect,
      });
      return post;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      await prisma.earningEntry.delete({ where: { id } });
      return {
        id,
      };
    },
  });
