import { createRouter } from "../createRouter";
import { earningsRouter } from "./earnings";
import superjson from "superjson";
import { userRouter } from "./user";
import { expensesRouter } from "./expenses";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("health", {
    async resolve() {
      return "yay!";
    },
  })
  .merge("user.", userRouter)
  .merge("earnings.", earningsRouter)
  .merge("expenses.", expensesRouter);

export type AppRouter = typeof appRouter;
