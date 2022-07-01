import type * as trpc from "@trpc/server";
import type * as trpcNext from "@trpc/server/adapters/next";

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export async function createContext(_options: trpcNext.CreateNextContextOptions) {
  _options;

  return {
    user: null,
  };
}
