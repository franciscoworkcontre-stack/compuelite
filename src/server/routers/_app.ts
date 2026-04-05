import { createTRPCRouter } from "../trpc";
import { productsRouter } from "./products";
import { builderRouter } from "./builder";
import { ordersRouter } from "./orders";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  builder: builderRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
