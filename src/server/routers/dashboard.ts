import { TRPCError } from "@trpc/server";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { z } from "zod";
import { defaultEarningsSelect } from "./expenses";
import { incomeSelect } from "./income";

export const dashboardRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("all-infinite", {
    input: z.number().min(2018).max(2099),
    async resolve({ input }) {
      const year = input || new Date().getFullYear();

      const [expenses, income] = await Promise.all([
        prisma.expenses.findMany({
          where: { date: { year } },
          select: defaultEarningsSelect,
          orderBy: { createdAt: "asc" },
        }),
        prisma.income.findMany({
          where: { date: { year } },
          select: incomeSelect,
          orderBy: { createdAt: "asc" },
        }),
      ]);

      return { expenses, income };
    },
  });
