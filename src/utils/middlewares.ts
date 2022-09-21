import { TRPCError } from "@trpc/server";
import { t } from "server/trpc";

export const isAuth = t.procedure.use(
  t.middleware(({ next, ctx }) => {
    if (!ctx.session || !ctx.dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  }),
);
