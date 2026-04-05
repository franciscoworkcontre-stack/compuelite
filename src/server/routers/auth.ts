import { z } from "zod";
import { hash } from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Este email ya está registrado." });
      }

      const passwordHash = await hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
        },
        select: { id: true, email: true, name: true },
      });

      return user;
    }),

  // Uses session — no userId input needed (prevents IDOR)
  me: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              items: {
                include: { product: { select: { name: true, slug: true, images: { take: 1 } } } },
              },
            },
          },
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: { id: true, name: true, email: true, phone: true },
      });
    }),
});
