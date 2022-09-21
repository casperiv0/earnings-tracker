import { t } from "server/trpc";
import { getUserFromSession } from "utils/nextauth";
import { prisma } from "utils/prisma";
import { isAuth } from "utils/middlewares";
import { z } from "zod";
import { incomeSelect } from "./income";

export const dashboardRouter = t.router({
  getDashboardData: isAuth
    .input(
      z
        .number()
        .min(2018)
        .max(2099)
        .or(z.enum(["all-time"])),
    )
    .query(async ({ ctx, input }) => {
      const year = input || new Date().getFullYear();
      const userId = getUserFromSession(ctx).dbUser.id;

      const [expenses, income] = await Promise.all([
        prisma.expenses.findMany({
          where: { date: { year: typeof year === "number" ? year : undefined }, userId },
          orderBy: { createdAt: "asc" },
          include: { date: true },
        }),
        prisma.income.findMany({
          where: { date: { year: typeof year === "number" ? year : undefined }, userId },
          select: incomeSelect,
          orderBy: { createdAt: "asc" },
        }),
      ]);

      return { expenses, income };
    }),
});
