import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";

const defaultEarningsSelect = Prisma.validator<Prisma.EarningEntrySelect>()({
  id: true,
  user: true,
  userId: true,
  date: true,
  dateId: true,
  month: true,
  income: true,
  expenses: true,
  workedHours: true,
});

export const earningsRouter = createRouter()
  // create
  .mutation("add", {
    input: z.object({
      title: z.string().min(1).max(32),
      text: z.string().min(1),
    }),
    async resolve({ input }) {
      const post = await prisma.earningEntry.create({
        data: input,
        select: defaultEarningsSelect,
      });
      return post;
    },
  })
  // read
  .query("all", {
    async resolve() {
      /**
       * For pagination you can have a look at this docs site
       * @link https://trpc.io/docs/useInfiniteQuery
       */

      return prisma.earningEntry.findMany({
        select: defaultEarningsSelect,
      });
    },
  })
  .query("byId", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      const post = await prisma.earningEntry.findUnique({
        where: { id },
        select: defaultEarningsSelect,
      });
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No post with id '${id}'`,
        });
      }
      return post;
    },
  })
  // update
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
  // delete
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
