import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

import { deleteRecursive } from "./files";
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

export const getProcessingMessages = query({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_project_and_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "processing"),
      )
      .collect();

    return messages;
  },
});

export const updateMessageStatus = mutation({
  args: {
    internalKey: v.string(),
    messageId: v.id("messages"),
    status: v.union(
      v.literal("completed"),
      v.literal("processing"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    await ctx.db.patch(args.messageId, {
      status: args.status,
    });
  },
});

export const getRecentMessages = query({
  args: {
    internalKey: v.string(),
    limit: v.optional(v.number()),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(args.limit || 10);

    return messages;
  },
});

export const updateConversationTitle = mutation({
  args: {
    internalKey: v.string(),
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const getProjectFiles = query({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return files;
  },
});

export const getFileById = query({
  args: {
    internalKey: v.string(),
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    return ctx.db.get(args.fileId);
  },
});

export const updateFileContent = mutation({
  args: {
    internalKey: v.string(),
    fileId: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    await ctx.db.patch(args.fileId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const createFile = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const existingFile = files.find(
      (file) => file.name && file.type === "file",
    );
    if (existingFile) {
      throw new ConvexError("File already exists");
    }

    const fileId = ctx.db.insert("files", {
      projectId: args.projectId,
      name: args.name,
      content: args.content,
      parentId: args.parentId,
      type: "file",
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

export const createFiles = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    files: v.array(
      v.object({
        name: v.string(),
        content: v.string(),
        parentId: v.optional(v.id("files")),
      }),
    ),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const existingFiles = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const results: { name: string; fieldId: string; error?: string }[] = [];

    for (const file of args.files) {
      const existingFile = existingFiles.find(
        (f) => f.name && f.type === "file",
      );

      if (existingFile) {
        results.push({
          name: file.name,
          fieldId: "",
          error: "File already exists",
        });
        continue;
      }

      const fileId = await ctx.db.insert("files", {
        projectId: args.projectId,
        name: file.name,
        content: file.content,
        parentId: args.parentId,
        type: "file",
        updatedAt: Date.now(),
      });

      results.push({
        name: file.name,
        fieldId: fileId,
      });
    }

    return results;
  },
});

export const createFolder = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const folders = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId))
      .collect();

    const existingFolder = folders.find(
      (folder) => folder.name && folder.type === "folder",
    );

    if (existingFolder) {
      throw new ConvexError("Folder already exists");
    }

    const fileId = ctx.db.insert("files", {
      projectId: args.projectId,
      name: args.name,
      parentId: args.parentId,
      type: "folder",
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

export const renameFile = mutation({
  args: {
    internalKey: v.string(),
    fileId: v.id("files"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("File not found");
    }

    const siblings = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId),
      )
      .collect();

    const existingFile = siblings.find(
      (f) =>
        f.name === args.name && f.type === file.type && f._id !== args.fileId,
    );

    if (existingFile) {
      throw new ConvexError("File already exists");
    }

    await ctx.db.patch(args.fileId, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});

export const deleteFile = mutation({
  args: {
    internalKey: v.string(),
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    validateInternalKey(args.internalKey);

    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("File not found");
    }

    await deleteRecursive({ fileId: file._id, ctx });

    return args.fileId;
  },
});
