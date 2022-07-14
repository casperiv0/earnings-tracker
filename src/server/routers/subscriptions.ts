import { Prisma, SubscriptionType } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";
import { TABLE_FILTER } from "./income";
import { createPrismaWhereFromFilters, getOrderByFromInput } from "utils/utils";

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

export const subscriptionsRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("all-infinite", {
    input: z.object({
      page: z.number(),
      sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional(),
      filters: z.array(TABLE_FILTER).optional(),
    }),
    async resolve({ input }) {
      const skip = input.page * MAX_ITEMS_PER_TABLE;

      const [totalCount, items] = await Promise.all([
        prisma.subscription.count({
          where: input.filters ? createPrismaWhereFromFilters(input.filters) : undefined,
        }),
        prisma.subscription.findMany({
          take: MAX_ITEMS_PER_TABLE,
          skip,
          select: subscriptionSelect,
          orderBy: getOrderByFromInput(input),
          where: input.filters ? createPrismaWhereFromFilters(input.filters) : undefined,
        }),
      ]);

      return { maxPages: Math.floor(totalCount / MAX_ITEMS_PER_TABLE), items };
    },
  })
  .mutation("add-subscription", {
    input: z.object({
      price: z.number().min(1),
      name: z.string(),
      type: z.nativeEnum(SubscriptionType),
      description: z.string().nullable().optional(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.dbUser?.id ?? "62bee0cd017b854271152f8b";

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const post = await prisma.subscription.create({
        data: {
          price: input.price,
          name: input.name,
          description: input.description,
          type: input.type,
          user: { connect: { id: userId } },
        },
        select: subscriptionSelect,
      });

      return post;
    },
  })
  .mutation("edit-subscription", {
    input: z.object({
      id: z.string(),
      price: z.number().min(1),
      name: z.string(),
      type: z.nativeEnum(SubscriptionType),
      description: z.string().nullable().optional(),
    }),
    async resolve({ input }) {
      const post = await prisma.subscription.update({
        where: { id: input.id },
        data: {
          price: input.price,
          name: input.name,
          description: input.description,
          type: input.type,
        },
        select: subscriptionSelect,
      });
      return post;
    },
  })
  .mutation("bulk-delete-subscription", {
    input: z.object({
      ids: z.array(z.string()),
    }),
    async resolve({ input }) {
      const { ids } = input;

      await prisma.$transaction(
        ids.map((id) =>
          prisma.subscription.delete({
            where: { id },
          }),
        ),
      );
    },
  })
  .mutation("delete-subscription", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      await prisma.subscription.delete({ where: { id } });
    },
  });
