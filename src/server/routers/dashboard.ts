import { TRPCError } from "@trpc/server";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { defaultEarningsSelect } from "./expenses";

export const dashboardRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("all-infinite", {
    async resolve() {
      const currentYear = new Date().getFullYear();

      const [expenses, income] = await Promise.all([
        prisma.expenses.findMany({
          where: { date: { year: currentYear } },
          select: defaultEarningsSelect,
          orderBy: { createdAt: "asc" },
        }),
        prisma.income.findMany({
          where: { date: { year: currentYear } },
          select: defaultEarningsSelect,
          orderBy: { createdAt: "asc" },
        }),
      ]);

      return { expenses, income };
    },
  });
