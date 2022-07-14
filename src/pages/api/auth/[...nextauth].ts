import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "utils/prisma";

if (!process.env.GITHUB_ID || !process.env.SECRET || !process.env.GITHUB_SECRET) {
  throw new Error("Must set GITHUB_ID, SECRET, and GITHUB_SECRET in environment");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.SECRET,
  providers: [
    GithubProvider({
      authorization: { params: { scope: "read:user user:email" } },
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const { image, avatar_url } = profile;

      const email = profile.email || user.email;
      const name = profile.name || user.name;
      const imageUrl = String(image || avatar_url || user.image) || null;

      if (!email || !name) {
        return false;
      }

      await prisma.user.upsert({
        where: { email },
        create: { email, name, imageUrl },
        update: { email, name, imageUrl },
      });

      return true;
    },
  },
};

export default NextAuth(authOptions);
