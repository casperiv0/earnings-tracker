import { Month } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { defaultEarningsSelect } from "./expenses";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";

export const incomeRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("all-infinite", {
    input: z.number(),
    async resolve({ input }) {
      const skip = input * MAX_ITEMS_PER_TABLE;

      const [totalCount, items] = await Promise.all([
        prisma.income.count(),
        prisma.income.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          select: defaultEarningsSelect,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items };
    },
  })
  .mutation("add-income", {
    input: z.object({
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.dbUser!.id;

      const post = await prisma.income.create({
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
  .mutation("edit-income", {
    input: z.object({
      id: z.string(),
      amount: z.number().min(1),
      year: z.number(),
      description: z.string().nullable().optional(),
      month: z.nativeEnum(Month),
    }),
    async resolve({ input }) {
      const post = await prisma.income.update({
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
  .mutation("bulk-delete-income", {
    input: z.object({
      ids: z.array(z.string()),
    }),
    async resolve({ input }) {
      await prisma.$transaction(
        input.ids.map((id) =>
          prisma.income.delete({
            where: { id },
          }),
        ),
      );
    },
  })
  .mutation("delete-income", {
    input: z.object({ id: z.string() }),
    async resolve({ input }) {
      await prisma.income.delete({ where: { id: input.id } });
    },
  });
