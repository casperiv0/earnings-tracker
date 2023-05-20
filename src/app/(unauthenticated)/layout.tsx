import "~/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "../providers";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Earnings Tracker",
  description: "A simple and good looking income/expenses tracker.",
};

export default async function RootLayout(props: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="md:flex">{props.children}</div>
        </Providers>
      </body>
    </html>
  );
}
