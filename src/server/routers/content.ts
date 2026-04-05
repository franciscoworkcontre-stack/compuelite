import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { BlockType, type Prisma } from "@prisma/client";

const blockDataSchema = z.record(z.string(), z.unknown());

function isActiveNow(block: { active: boolean; startsAt: Date | null; endsAt: Date | null }) {
  if (!block.active) return false;
  const now = new Date();
  if (block.startsAt && block.startsAt > now) return false;
  if (block.endsAt && block.endsAt < now) return false;
  return true;
}

export const contentRouter = createTRPCRouter({
  // Fetch active blocks for a zone — used by server components
  byZone: publicProcedure
    .input(z.object({ zone: z.string() }))
    .query(async ({ ctx, input }) => {
      const blocks = await ctx.db.contentBlock.findMany({
        where: { zone: input.zone, active: true },
        orderBy: { order: "asc" },
      });
      return blocks.filter(isActiveNow);
    }),

  // Admin: list all blocks
  list: adminProcedure
    .input(z.object({ zone: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.contentBlock.findMany({
        where: input.zone ? { zone: input.zone } : undefined,
        orderBy: [{ zone: "asc" }, { order: "asc" }],
      });
    }),

  // Admin: create a block
  create: adminProcedure
    .input(z.object({
      zone: z.string().min(1),
      type: z.nativeEnum(BlockType),
      data: blockDataSchema,
      label: z.string().optional(),
      active: z.boolean().default(false),
      order: z.number().int().default(0),
      startsAt: z.string().datetime().optional(),
      endsAt: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contentBlock.create({
        data: {
          zone: input.zone,
          type: input.type,
          data: input.data as Prisma.InputJsonValue,
          label: input.label,
          active: input.active,
          order: input.order,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
        },
      });
    }),

  // Admin: update a block
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      data: blockDataSchema.optional(),
      label: z.string().optional(),
      active: z.boolean().optional(),
      order: z.number().int().optional(),
      startsAt: z.string().datetime().nullable().optional(),
      endsAt: z.string().datetime().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, startsAt, endsAt, data, ...rest } = input;
      return ctx.db.contentBlock.update({
        where: { id },
        data: {
          ...rest,
          ...(data !== undefined && { data: data as Prisma.InputJsonValue }),
          ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
          ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
        },
      });
    }),

  // Admin: delete a block
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.contentBlock.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // Admin: toggle active
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({ where: { id: input.id } });
      if (!block) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.contentBlock.update({
        where: { id: input.id },
        data: { active: !block.active },
      });
    }),
});
