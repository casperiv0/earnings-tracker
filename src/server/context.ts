import type * as trpc from "@trpc/server";
import type * as trpcNext from "@trpc/server/adapters/next";
import { getServerSession } from "utils/nextauth";

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export async function createContext(options: trpcNext.CreateNextContextOptions) {
  const session = await getServerSession(options);

  return {
    session,
  };
}
