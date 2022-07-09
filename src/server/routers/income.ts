import { Month } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { defaultEarningsSelect } from "./expenses";

export const incomeRouter = createRouter()
  .query("all-infinite", {
    input: z.number(),
    async resolve({ input }) {
      const skip = input * 35;

      const [totalCount, items] = await Promise.all([
        prisma.income.count(),
        prisma.income.findMany({
          take: 35,
          skip,
          select: defaultEarningsSelect,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return { maxPages: Math.floor(totalCount / 35), items };
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
      const userId = ctx.dbUser?.id ?? "62bee0cd017b854271152f8b";

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
      const { id, ...data } = input;
      const post = await prisma.income.update({
        where: { id },
        data: {
          amount: data.amount,
          description: data.description,
          date: { update: { month: data.month, year: data.year } },
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
      const { ids } = input;

      await prisma.$transaction(
        ids.map((id) =>
          prisma.income.delete({
            where: { id },
          }),
        ),
      );

      return {
        ids,
      };
    },
  })
  .mutation("delete-income", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      await prisma.income.delete({ where: { id } });

      return {
        id,
      };
    },
  });
