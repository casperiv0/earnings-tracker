import { createRouter } from "../createRouter";
import { earningsRouter } from "./earnings";
import superjson from "superjson";
import { userRouter } from "./user";
import { expensesRouter } from "./expenses";
import { incomeRouter } from "./income";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("health", {
    async resolve() {
      return "yay!";
    },
  })
  .merge("user.", userRouter)
  .merge("earnings.", earningsRouter)
  .merge("expenses.", expensesRouter)
  .merge("income.", incomeRouter);

export type AppRouter = typeof appRouter;
