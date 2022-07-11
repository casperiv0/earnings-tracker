import { Prisma, SubscriptionType } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "server/createRouter";
import { prisma } from "utils/prisma";
import { TRPCError } from "@trpc/server";

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
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("all-infinite", {
    input: z.number(),
    async resolve({ input }) {
      const skip = input * 35;

      const [totalCount, items] = await Promise.all([
        prisma.subscription.count(),
        prisma.subscription.findMany({
          take: 35,
          skip,
          select: subscriptionSelect,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return { maxPages: Math.floor(totalCount / 35), items };
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

      return {
        ids,
      };
    },
  })
  .mutation("delete-subscription", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      await prisma.subscription.delete({ where: { id } });

      return {
        id,
      };
    },
  });
