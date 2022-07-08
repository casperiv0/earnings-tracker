import { Month, Prisma } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "server/prisma";
import { TRPCError } from "@trpc/server";

const defaultEarningsSelect = Prisma.validator<Prisma.ExpensesSelect>()({
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
  .query("all-infinite", {
    input: z.number(),
    async resolve({ input }) {
      const skip = input * 35;

      const [totalCount, items] = await Promise.all([
        prisma.expenses.count(),
        prisma.expenses.findMany({
          take: 35,
          skip,
          select: defaultEarningsSelect,
          orderBy: {
            date: { year: "desc" },
          },
        }),
      ]);

      return { maxPages: Math.floor(totalCount / 35), items };
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
      const userId = ctx.dbUser?.id ?? "62bee0cd017b854271152f8b";

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      console.log("here");

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
      const { id, ...data } = input;
      const post = await prisma.expenses.update({
        where: { id },
        data,
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
      return {
        id,
      };
    },
  });
