import Head from "next/head";
import * as React from "react";
import { ReactQueryDevtools } from "react-query/devtools";

interface LayoutProps {
  children: React.ReactNode;
}

export function DefaultLayout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Earnings Tracker</title>
      </Head>

      <main>{children}</main>

      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
    </>
  );
}
