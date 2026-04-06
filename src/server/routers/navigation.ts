import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";

export const navigationRouter = createTRPCRouter({
  // Public — used by HomeSidebar
  sidebarItems: publicProcedure.query(({ ctx }) =>
    ctx.db.sidebarItem.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    })
  ),

  // Admin — all items including hidden
  sidebarItemsAdmin: adminProcedure.query(({ ctx }) =>
    ctx.db.sidebarItem.findMany({ orderBy: { order: "asc" } })
  ),

  // Admin — create item
  createSidebarItem: adminProcedure
    .input(z.object({
      type:    z.enum(["link", "divider", "heading"]),
      label:   z.string().optional(),
      href:    z.string().optional(),
      icon:    z.string().optional(),
      anim:    z.string().optional(),
      visible: z.boolean().default(true),
      order:   z.number().int().default(0),
    }))
    .mutation(({ ctx, input }) =>
      ctx.db.sidebarItem.create({ data: input })
    ),

  // Admin — update item
  updateSidebarItem: adminProcedure
    .input(z.object({
      id:      z.string(),
      label:   z.string().nullable().optional(),
      href:    z.string().nullable().optional(),
      icon:    z.string().nullable().optional(),
      anim:    z.string().nullable().optional(),
      visible: z.boolean().optional(),
      order:   z.number().int().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.sidebarItem.update({ where: { id }, data });
    }),

  // Admin — delete item
  deleteSidebarItem: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.sidebarItem.delete({ where: { id: input.id } })
    ),

  // Admin — reorder (accepts full array of { id, order })
  reorderSidebarItems: adminProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
    .mutation(({ ctx, input }) =>
      Promise.all(
        input.map(({ id, order }) =>
          ctx.db.sidebarItem.update({ where: { id }, data: { order } })
        )
      )
    ),
});
