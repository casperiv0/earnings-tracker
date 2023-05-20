import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Session, getServerSession as _getServerSession } from "next-auth";
import type { Context } from "server/context";
import { authOptions } from "~/app/api/auth/[...nextauth]/options";

export async function getServerSession() {
  return _getServerSession(authOptions);
}

export function getUserFromSession(ctx: Context): {
  session: Session;
  dbUser: User;
} {
  if (!ctx.session || !ctx.dbUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return ctx as any;
}
