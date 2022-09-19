import * as React from "react";
import { trpc } from "utils/trpc";
import type { AppProps } from "next/app";
import type { AppType } from "next/dist/shared/lib/utils";
import { Layout } from "components/ui/Layout";
import { SessionProvider } from "next-auth/react";

import "styles/globals.css";

const App = (({ Component, pageProps }: AppProps) => {
  const sessionQuery = trpc.user.getSession.useQuery();

  return (
    <SessionProvider session={sessionQuery.data?.session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}) as AppType;

export default trpc.withTRPC(App);
