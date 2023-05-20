import "~/styles/globals.css";
import { Metadata } from "next";
import { serverApi } from "~/utils/trpc/server";
import { Providers } from "../providers";
import { redirect } from "next/navigation";
import { Sidebar } from "~/components/sidebar/Sidebar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Earnings Tracker",
  description: "A simple and good looking income/expenses tracker.",
};

export default async function RootLayout(props: RootLayoutProps) {
  const sessionQuery = await serverApi.user.getSession.query().catch(() => null);

  if (!sessionQuery?.session || !sessionQuery.user) {
    return redirect("/login");
  }

  return (
    <html lang="en">
      <body>
        <Providers session={sessionQuery.session}>
          <div className="md:flex">
            <Sidebar />
            <div className="w-0 md:w-72 flex-shrink-0" />

            <main className="layout-main">{props.children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
