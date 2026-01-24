import { ConvexError } from "convex/values";
import { convex } from "@convex-dev/better-auth/plugins";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";

import authConfig from "./auth.config";
import { components } from "./_generated/api";
import { betterAuth } from "better-auth/minimal";
import { DataModel } from "./_generated/dataModel";
import { MutationCtx, query, QueryCtx } from "./_generated/server";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    plugins: [convex({ authConfig })],
  });
};

export const isAuthenticated = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("User Not Authenticated");

  return identity;
};

export const validateInternalKey = (key: string) => {
  const internalKey = process.env.CONVEX_INTERNAL_KEY;
  if (!internalKey) throw new ConvexError("Internal Key Not Found");

  if (key !== internalKey) throw new ConvexError("Invalid Internal Key");
};
