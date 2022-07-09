import { createRouter } from "../createRouter";
import superjson from "superjson";
import { userRouter } from "./user";
import { expensesRouter } from "./expenses";
import { incomeRouter } from "./income";
import { dashboardRouter } from "./dashboard";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("expenses.", expensesRouter)
  .merge("income.", incomeRouter)
  .merge("dashboard.", dashboardRouter);

export type AppRouter = typeof appRouter;
