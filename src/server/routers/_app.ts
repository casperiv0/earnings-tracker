import { t } from "../trpc";
import { userRouter } from "./user";
import { expensesRouter } from "./expenses";
import { incomeRouter } from "./income";
import { dashboardRouter } from "./dashboard";
import { subscriptionsRouter } from "./subscriptions";

export const appRouter = t.router({
  user: userRouter,
  expenses: expensesRouter,
  income: incomeRouter,
  dashboard: dashboardRouter,
  subscriptions: subscriptionsRouter,
});

export type AppRouter = typeof appRouter;
