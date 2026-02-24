import { ConvexError, v } from "convex/values";
import { convex } from "@convex-dev/better-auth/plugins";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";

import authConfig from "./auth.config";
import { components } from "./_generated/api";
import { betterAuth } from "better-auth/minimal";
import { DataModel } from "./_generated/dataModel";
import { MutationCtx, query, QueryCtx } from "./_generated/server";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const siteUrl =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.CONVEX_SITE_URL;
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    socialProviders: {
      github: {
        clientId: githubClientId!,
        clientSecret: githubClientSecret!,
      },
    },
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

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const [identity, authUser] = await Promise.all([
      ctx.auth.getUserIdentity(),
      authComponent.getAuthUser(ctx),
    ]);

    if (!identity || !authUser) {
      throw new ConvexError("User not authenticated");
    }

    return {
      authUser,
      identity,
    };
  },
});

export const getUserAccount = query({
  args: { userId: v.string(), providerId: v.string() },
  handler: async (ctx, args) => {
    return ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "account",
      where: [
        {
          field: "userId",
          value: args.userId,
        },
        {
          field: "providerId",
          value: args.providerId,
        },
      ],
    });
  },
});
