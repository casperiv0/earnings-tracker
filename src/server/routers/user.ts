import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { t } from "server/trpc";
import { prisma } from "utils/prisma";
import { isAuth } from "utils/middlewares";
import { z } from "zod";

const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  imageUrl: true,
  name: true,
  configuration: true,
});

export const userRouter = t.router({
  getSession: isAuth.query(async ({ ctx }) => {
    const dbUser = await prisma.user.findUnique({
      where: { email: ctx.dbUser!.email },
      select: defaultUserSelect,
    });

    return { session: ctx.session, user: dbUser };
  }),
  deleteUser: isAuth.mutation(async ({ ctx }) => {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    await prisma.user.delete({
      where: { email: ctx.session.user.email },
    });

    return { deleted: true };
  }),
  updateUserConfiguration: isAuth
    .input(
      z.object({
        maxYearlyIncome: z.number().nullable(),
        maxYearlyHours: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await prisma.user.update({
        where: { email: ctx.session.user.email },
        data: {
          configuration: {
            upsert: {
              create: {
                maxYearlyIncome: input.maxYearlyIncome,
                maxYearlyHours: input.maxYearlyHours,
              },
              update: {
                maxYearlyIncome: input.maxYearlyIncome,
                maxYearlyHours: input.maxYearlyHours,
              },
            },
          },
        },
        select: defaultUserSelect,
      });

      return { user };
    }),
});
