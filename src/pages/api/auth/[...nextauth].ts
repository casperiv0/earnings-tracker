import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "server/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.SECRET,
  providers: [
    GithubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile.email;

      if (!email) {
        return false;
      }

      await prisma.user.upsert({
        where: { email },
        create: { email },
        update: { email },
      });

      return true;
    },
  },
};

export default NextAuth(authOptions);
