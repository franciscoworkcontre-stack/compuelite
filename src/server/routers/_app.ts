import { createTRPCRouter } from "../trpc";
import { productsRouter } from "./products";
import { builderRouter } from "./builder";
import { ordersRouter } from "./orders";
import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { reviewsRouter } from "./reviews";
import { paymentsRouter } from "./payments";
import { couponsRouter } from "./coupons";
import { contentRouter } from "./content";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  builder: builderRouter,
  orders: ordersRouter,
  admin: adminRouter,
  auth: authRouter,
  reviews: reviewsRouter,
  payments: paymentsRouter,
  coupons: couponsRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
