import { createReactQueryHooks } from "@trpc/react";
import { TRPCError } from "@trpc/server";
import type { AppRouter } from "server/routers/_app";
import { t } from "server/trpc";

export const trpc = createReactQueryHooks<AppRouter>();

export const isAuth = t.procedure.use(
  t.middleware(({ next, ctx }) => {
    if (!ctx.session || !ctx.dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  }),
);
