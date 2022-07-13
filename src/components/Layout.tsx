import Head from "next/head";
import { useRouter } from "next/router";
import * as React from "react";
import { trpc } from "utils/trpc";
import { Loader } from "./Loader";
import { Sidebar } from "./sidebar/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const sessionQuery = trpc.useQuery(["user.getSession"], { ssr: false });
  const router = useRouter();

  React.useEffect(() => {
    if (!sessionQuery.data && !sessionQuery.isLoading && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [sessionQuery, router]);

  if ((sessionQuery.isLoading || !sessionQuery.data) && router.pathname !== "/login") {
    return <Loader fixed />;
  }

  return (
    <>
      <Head>
        <title>Earnings Tracker</title>

        <link rel="preload" href="/fonts/Raleway-VF.ttf" as="font" type="font/ttf" crossOrigin="" />
        <link
          rel="preload"
          href="/fonts/RobotoSlab-VF.ttf"
          as="font"
          type="font/ttf"
          crossOrigin=""
        />
        <meta name="description" content="A simple and good looking income/expenses tracker." />
      </Head>

      <div className="flex">
        {router.pathname === "/login" ? null : (
          <>
            <Sidebar />
            <div className="w-72 flex-shrink-0" />
          </>
        )}
        <main className="layout-main">{children}</main>
      </div>
    </>
  );
}
