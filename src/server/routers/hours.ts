import { Month } from "@prisma/client";
import { z } from "zod";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { TABLE_FILTER } from "./income";
import { getUserFromSession } from "utils/nextauth";
import { t } from "server/trpc";
import { isAuth } from "utils/middlewares";

export const ADD_HOUR_INPUT = z.object({
  amount: z.number().min(1),
  year: z.number(),
  month: z.nativeEnum(Month),
  day: z.number(),
  description: z.string().nullish(),
  tag: z.string(),
});

export const EDIT_HOUR_INPUT = ADD_HOUR_INPUT.extend({
  id: z.string().min(2),
});

export const hoursRouter = t.router({
  getInfinitelyScrollableHours: isAuth
    .input(
      z.object({
        page: z.number(),
        sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional(),
        filters: z.array(TABLE_FILTER).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = input.page * MAX_ITEMS_PER_TABLE;
      const userId = getUserFromSession(ctx).dbUser.id;

      const [totalCount, hours] = await Promise.all([
        prisma.hours.count({
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, {
                userId,
              })
            : { userId },
        }),
        prisma.hours.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          include: { date: true },
          orderBy: getOrderByFromInput(input),
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, {
                userId,
              })
            : { userId },
        }),
      ]);

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items: hours };
    }),
  addHour: isAuth.input(ADD_HOUR_INPUT).mutation(async ({ ctx, input }) => {
    const userId = getUserFromSession(ctx).dbUser.id;

    const createdHour = await prisma.hours.create({
      data: {
        amount: input.amount,
        description: input.description,
        date: {
          create: { month: input.month, year: input.year, day: input.day },
        },
        user: { connect: { id: userId } },
        tag: input.tag,
      },
    });
    return createdHour;
  }),
  editHour: isAuth.input(EDIT_HOUR_INPUT).mutation(async ({ ctx, input }) => {
    const userId = getUserFromSession(ctx).dbUser.id;

    const hour = await prisma.hours.findFirst({
      where: { userId, id: input.id },
    });

    if (!hour) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const updatedHour = await prisma.hours.update({
      where: { id: input.id },
      data: {
        amount: input.amount,
        description: input.description,
        date: { update: { month: input.month, year: input.year, day: input.day } },
        tag: input.tag,
      },
      include: { date: true },
    });
    return updatedHour;
  }),
  deleteHour: isAuth
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserFromSession(ctx).dbUser.id;

      const hour = await prisma.hours.findFirst({
        where: { userId, id: input.id },
      });

      if (!hour) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await prisma.hours.delete({ where: { id: input.id } });
    }),
  deletedSelectedHours: isAuth.input(z.array(z.string())).mutation(async ({ ctx, input }) => {
    const userId = getUserFromSession(ctx).dbUser.id;

    await prisma.$transaction(
      input.map((id) =>
        prisma.hours.delete({
          where: { id, userId },
        }),
      ),
    );
  }),
});
