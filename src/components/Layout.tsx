import Head from "next/head";
import * as React from "react";
// import { ReactQueryDevtools } from "react-query/devtools";
import { Sidebar } from "./sidebar/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Earnings Tracker</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main>{children}</main>
      </div>

      {/* {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />} */}
    </>
  );
}
