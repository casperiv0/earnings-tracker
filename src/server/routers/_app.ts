import { createRouter } from "../createRouter";
import { earningsRouter } from "./earnings";
import superjson from "superjson";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("health", {
    async resolve() {
      return "yay!";
    },
  })
  .merge("earnings.", earningsRouter);

export type AppRouter = typeof appRouter;
