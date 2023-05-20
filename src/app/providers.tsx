"use client";

import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
  session?: any;
}

export function Providers(props: ProvidersProps) {
  return <SessionProvider session={props.session}>{props.children}</SessionProvider>;
}
