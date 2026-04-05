import { createTRPCRouter } from "../trpc";
import { productsRouter } from "./products";
import { builderRouter } from "./builder";
import { ordersRouter } from "./orders";
import { adminRouter } from "./admin";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  builder: builderRouter,
  orders: ordersRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
