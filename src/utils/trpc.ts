import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";
import { TRPCError } from "@trpc/server";
import { t } from "server/trpc";
import { httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "server/routers/_app";

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      headers() {
        return {
          cookie: ctx?.req?.headers.cookie,
          "accept-language": ctx?.req?.headers["accept-language"],
          ssr: "true",
        };
      },
      url: getBaseUrl(),
      fetch(url: RequestInfo | URL, options?: RequestInit | undefined) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: superjson,
    };
  },
  ssr: true,
});

function getBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://earnings.caspertheghost.me";
  }

  if (typeof window !== "undefined") {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const isAuth = t.procedure.use(
  t.middleware(({ next, ctx }) => {
    if (!ctx.session || !ctx.dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  }),
);
