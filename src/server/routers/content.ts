import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { BlockType, type Prisma } from "@prisma/client";

// Default section definitions — used to seed or reset
export const DEFAULT_SECTIONS = [
  { slug: "featured_banners", label: "Banners Destacados", order: 1, config: {} },
  { slug: "best_deals",       label: "Ofertas del Día",   order: 2, config: { title: "Ofertas del Día", maxItems: 6 } },
  { slug: "builds_by_type",   label: "Builds por Nivel",  order: 3, config: {
    title: "Builds por Nivel",
    types: [
      { slug: "pc-gamer-start-series", visible: true, priceFrom: 399990 },
      { slug: "pc-gamer-pro-series",   visible: true, priceFrom: 799990 },
      { slug: "pc-elite",              visible: true, priceFrom: 1899990 },
      { slug: "workstation",           visible: true, priceFrom: 1299990 },
      { slug: "componentes",           visible: true, priceFrom: 249990 },
    ],
  }},
  { slug: "brand_logos",      label: "Marcas",             order: 4, config: {} },
  { slug: "trust_signals",    label: "Señales de Confianza", order: 5, config: {} },
];

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

  // ─── Homepage banners ────────────────────────────────────────────────────

  // Public: get active banners ordered
  banners: publicProcedure.query(({ ctx }) =>
    ctx.db.homepageBanner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    })
  ),

  // Admin: get all banners
  bannersAdmin: adminProcedure.query(({ ctx }) =>
    ctx.db.homepageBanner.findMany({ orderBy: { order: "asc" } })
  ),

  // Admin: create banner
  createBanner: adminProcedure
    .input(z.object({
      title:       z.string().min(1),
      subtitle:    z.string().optional(),
      imageUrl:    z.string().url(),
      href:        z.string().min(1),
      accentColor: z.string().default("#00ff66"),
      isActive:    z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.homepageBanner.count();
      return ctx.db.homepageBanner.create({ data: { ...input, order: count + 1 } });
    }),

  // Admin: update banner
  updateBanner: adminProcedure
    .input(z.object({
      id:          z.string(),
      title:       z.string().min(1).optional(),
      subtitle:    z.string().nullable().optional(),
      imageUrl:    z.string().url().optional(),
      href:        z.string().min(1).optional(),
      accentColor: z.string().optional(),
      isActive:    z.boolean().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.homepageBanner.update({ where: { id }, data });
    }),

  // Admin: delete banner
  deleteBanner: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.homepageBanner.delete({ where: { id: input.id } })
    ),

  // Admin: reorder banners
  reorderBanners: adminProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
    .mutation(({ ctx, input }) =>
      Promise.all(input.map(({ id, order }) =>
        ctx.db.homepageBanner.update({ where: { id }, data: { order } })
      ))
    ),

  // ─── Homepage section CMS ────────────────────────────────────────────────

  // Public: get visible sections ordered — used by homepage
  homepageSections: publicProcedure.query(async ({ ctx }) => {
    const sections = await ctx.db.homepageSection.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    });
    // If no rows yet, return defaults so the homepage always works
    if (sections.length === 0) return DEFAULT_SECTIONS.map((s) => ({ ...s, id: s.slug, isVisible: true, updatedAt: new Date() }));
    return sections;
  }),

  // Admin: get all sections (visible + hidden) for management
  homepageSectionsAdmin: adminProcedure.query(async ({ ctx }) => {
    const sections = await ctx.db.homepageSection.findMany({ orderBy: { order: "asc" } });
    // Auto-seed if empty
    if (sections.length === 0) {
      await ctx.db.homepageSection.createMany({ data: DEFAULT_SECTIONS });
      return ctx.db.homepageSection.findMany({ orderBy: { order: "asc" } });
    }
    return sections;
  }),

  // Admin: toggle visibility
  toggleSectionVisibility: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.homepageSection.findUnique({ where: { id: input.id } });
      if (!section) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.homepageSection.update({
        where: { id: input.id },
        data: { isVisible: !section.isVisible },
      });
    }),

  // Admin: reorder — accepts full ordered array of { id, order }
  reorderSections: adminProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.map(({ id, order }) =>
          ctx.db.homepageSection.update({ where: { id }, data: { order } })
        )
      );
      return { success: true };
    }),

  // Admin: update label and/or config of a section
  updateSection: adminProcedure
    .input(z.object({
      id:       z.string(),
      label:    z.string().min(1).optional(),
      isVisible: z.boolean().optional(),
      config:   z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, config, ...rest } = input;
      return ctx.db.homepageSection.update({
        where: { id },
        data: {
          ...rest,
          ...(config !== undefined && { config: config as Prisma.InputJsonValue }),
        },
      });
    }),
});
