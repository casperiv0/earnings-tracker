import { getServerSession } from "~/utils/nextauth";
import { prisma } from "~/utils/prisma";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { headers } from "next/headers";

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function createContext(options?: FetchCreateContextFnOptions) {
  const session = await getServerSession();

  console.log("session", session);

  let dbUser;
  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  }

  return {
    req: options?.req,
    session,
    dbUser,
    headers: Object.fromEntries(headers()),
  };
}
