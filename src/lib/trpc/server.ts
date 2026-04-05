import "server-only";
import { createCallerFactory, createTRPCContext } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";
import { cache } from "react";

const createContext = cache(async () => {
  return createTRPCContext({ headers: new Headers() });
});

const createCaller = createCallerFactory(appRouter);

export const api = createCaller(createContext);
