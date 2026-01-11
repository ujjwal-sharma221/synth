import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

import { isAuthenticated } from "./auth";

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: identity.subject,
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

export const getPartial = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const query = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .take(args.limit);

    return query;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await isAuthenticated(ctx);

    const query = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .collect();

    return query;
  },
});

export const getById = query({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const project = await ctx.db.get("projects", args.id);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    return project;
  },
});

export const updateProjectName = mutation({
  args: {
    id: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const project = await ctx.db.get("projects", args.id);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    await ctx.db.patch("projects", args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return project;
  },
});
