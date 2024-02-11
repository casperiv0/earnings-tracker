import { createTRPCNext } from "@trpc/next";
import { ssrPrepass } from "@trpc/next/ssrPrepass";
import superjson from "superjson";
import { httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "server/routers/_app";

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  ssrPrepass,
  ssr: true,

  config({ ctx }) {
    if (typeof window !== "undefined") {
      return {
        links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
      };
    }

    return {
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          transformer: superjson,
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            if (ctx?.req) {
              return {
                cookie: ctx.req.headers.cookie,
              };
            }

            return {};
          },
        }),
      ],
    };
  },
});

function getBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://earnings.casperiv.dev";
  }

  if (typeof window !== "undefined") {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
