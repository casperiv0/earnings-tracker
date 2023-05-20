import Head from "next/head";
import { useRouter, usePathname } from "next/navigation";
import * as React from "react";
import { trpc } from "utils/trpc";
import { Sidebar } from "../sidebar/Sidebar";
import { Loader } from "./Loader";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const sessionQuery = trpc.user.getSession.useQuery();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!sessionQuery.data && !sessionQuery.isLoading && pathname !== "/login") {
      router.push("/login");
    }
  }, [sessionQuery, pathname, router]);

  if ((sessionQuery.isLoading || !sessionQuery.data) && pathname !== "/login") {
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

      <div className="md:flex">
        {pathname === "/login" ? null : (
          <>
            <Sidebar />
            <div className="w-0 md:w-72 flex-shrink-0" />
          </>
        )}

        <main className="layout-main">{children}</main>
      </div>
    </>
  );
}
