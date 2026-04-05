import { createTRPCRouter } from "../trpc";
import { productsRouter } from "./products";
import { builderRouter } from "./builder";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  builder: builderRouter,
});

export type AppRouter = typeof appRouter;
