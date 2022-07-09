import { Prisma } from "@prisma/client";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";

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

export const dashboardRouter = createRouter().query("all-infinite", {
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
