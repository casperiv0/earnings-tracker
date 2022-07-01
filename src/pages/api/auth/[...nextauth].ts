import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "server/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.SECRET,
  providers: [
    GithubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const { email, name, image, avatar_url } = profile;
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
