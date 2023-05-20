import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "utils/prisma";

if (
  !process.env.GITHUB_ID ||
  !process.env.SECRET ||
  !process.env.GITHUB_SECRET ||
  !process.env.GOOGLE_ID ||
  !process.env.GOOGLE_SECRET
) {
  throw new Error(
    "Must set GITHUB_ID, SECRET, GITHUB_SECRET, GOOGLE_ID, and GOOGLE_SECRET in environment",
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.SECRET,
  providers: [
    GithubProvider({
      authorization: { params: { scope: "read:user user:email" } },
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const { image, avatar_url } = profile as any;

      const email = profile?.email || user.email;
      const name = profile?.name || user.name;
      const imageUrl = String(image || avatar_url || user.image) || null;

      if (!email || !name) {
        return false;
      }

      const accountFields = {
        email,
        name,
        imageUrl,
        provider: imageUrl?.includes("github") ? "GitHub" : "Google",
      } as const;

      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          name,
          imageUrl,
          accounts: {
            create: accountFields,
          },
        },
        update: {
          email,
          name,
          imageUrl,
          accounts: {
            upsert: {
              where: {
                email_provider: {
                  provider: imageUrl?.includes("github") ? "GitHub" : "Google",
                  email,
                },
              },
              create: accountFields,
              update: accountFields,
            },
          },
        },
      });

      return true;
    },
  },
};
