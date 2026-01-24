import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

import { validateInternalKey } from "./auth";

export const getConversationById = query({
  args: { conversationId: v.id("conversations"), internalKey: v.string() },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    return ctx.db.get(args.conversationId);
  },
});

export const createMessage = mutation({
  args: {
    status: v.optional(
      v.union(
        v.literal("completed"),
        v.literal("processing"),
        v.literal("cancelled"),
      ),
    ),
    content: v.string(),
    internalKey: v.string(),
    projectId: v.id("projects"),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const messageId = ctx.db.insert("messages", {
      status: args.status,
      content: args.content,
      projectId: args.projectId,
      conversationId: args.conversationId,
      role: args.role,
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

export const updateMessageContent = mutation({
  args: {
    internalKey: v.string(),
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    await ctx.db.patch(args.messageId, {
      content: args.content,
      status: "completed",
    });
  },
});
