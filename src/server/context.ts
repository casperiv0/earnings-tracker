import type * as trpc from "@trpc/server";
import type * as trpcNext from "@trpc/server/adapters/next";
import { getServerSession } from "utils/nextauth";
import { prisma } from "./prisma";

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export async function createContext(options: trpcNext.CreateNextContextOptions) {
  const session = await getServerSession(options);

  let dbUser;
  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  }

  return {
    session,
    dbUser,
  };
}
