import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
