import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

interface Options {
  req: GetServerSidePropsContext["req"] | NextApiRequest;
  res: GetServerSidePropsContext["res"] | NextApiResponse;
}

export async function getServerSession({ req, res }: Options) {
  return unstable_getServerSession(req, res, authOptions);
}