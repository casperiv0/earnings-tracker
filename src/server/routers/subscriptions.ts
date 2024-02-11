import { Prisma, SubscriptionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "utils/prisma";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { TABLE_FILTER } from "./income";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";
import { getUserFromSession } from "utils/nextauth";
import { t } from "server/trpc";
import { isAuth } from "utils/middlewares";

const subscriptionSelect = Prisma.validator<Prisma.SubscriptionSelect>()({
  id: true,
  type: true,
  price: true,
  name: true,
  user: true,
  userId: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});

export const subscriptionsRouter = t.router({
  getInfiniteScrollableSubscriptions: isAuth
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

      const [totalCount, items] = await Promise.all([
        prisma.subscription.count({
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, { userId })
            : undefined,
        }),
        prisma.subscription.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          select: subscriptionSelect,
          orderBy: getOrderByFromInput(input),
          where: input.filters
            ? createPrismaWhereFromFilters(input.filters, { userId })
            : undefined,
        }),
      ]);

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items };
    }),
  addSubscription: isAuth
    .input(
      z.object({
        price: z.number().min(0.01),
        name: z.string(),
        type: z.nativeEnum(SubscriptionType),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserFromSession(ctx).dbUser.id;

      const subscription = await prisma.subscription.create({
        data: {
          price: input.price,
          name: input.name,
          description: input.description,
          type: input.type,
          user: { connect: { id: userId } },
        },
        select: subscriptionSelect,
      });

      return subscription;
    }),
  editSubscription: isAuth
    .input(
      z.object({
        id: z.string(),
        price: z.number().min(0.01),
        name: z.string(),
        type: z.nativeEnum(SubscriptionType),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserFromSession(ctx).dbUser.id;

      await prisma.subscription.findFirstOrThrow({
        where: { userId, id: input.id },
      });

      const subscription = await prisma.subscription.update({
        where: { id: input.id },
        data: {
          price: input.price,
          name: input.name,
          description: input.description,
          type: input.type,
        },
        select: subscriptionSelect,
      });
      return subscription;
    }),
  deleteSubscription: isAuth
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getUserFromSession(ctx).dbUser.id;

      await prisma.subscription.findFirstOrThrow({
        where: { userId, id: input.id },
      });

      await prisma.subscription.delete({ where: { id: input.id } });
    }),
});
