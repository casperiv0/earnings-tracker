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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="flex">
        <Sidebar />
        <div className="w-[370px]" />
        <main className="w-full">{children}</main>
      </div>

      {/* {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />} */}
    </>
  );
}
