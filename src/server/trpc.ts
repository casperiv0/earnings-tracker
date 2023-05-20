import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { Context, createContext } from "./context";
import { ZodError } from "zod";
import { experimental_createServerActionHandler } from "@trpc/next/app-dir/server";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const createAction = experimental_createServerActionHandler(t, {
  createContext() {
    return createContext();
  },
});
