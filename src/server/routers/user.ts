import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";

const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  imageUrl: true,
  name: true,
});

export const userRouter = createRouter().query("getSession", {
  async resolve({ ctx }) {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: ctx.session.user.email },
      select: defaultUserSelect,
    });

    return { session: ctx.session, user: dbUser };
  },
});
