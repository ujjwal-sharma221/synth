import { ConvexError, v } from "convex/values";

import { isAuthenticated } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";

export const getFiles = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    return await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getFile = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const file = await ctx.db.get("files", args.id);
    if (!file) throw new ConvexError("File Not Found");

    const project = await ctx.db.get("projects", file.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    return file;
  },
});

export const getFolderContents = query({
  args: { projectId: v.id("projects"), parentId: v.optional(v.id("files")) },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId),
      )
      .collect();

    const sortedFiles = files.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });

    return sortedFiles;
  },
});

export const createFile = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId),
      )
      .collect();

    const existingFile = files.find(
      (file) => file.name === args.name && file.type === "file",
    );
    if (existingFile) throw new ConvexError("File Already Exists");

    await ctx.db.insert("files", {
      projectId: args.projectId,
      name: args.name,
      content: args.content,
      parentId: args.parentId,
      type: "file",
      updatedAt: Date.now(),
    });

    await ctx.db.patch("projects", args.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const createFolder = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    const folders = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId),
      )
      .collect();

    const existingFolder = folders.find(
      (folder) => folder.name === args.name && folder.type === "folder",
    );
    if (existingFolder) throw new ConvexError("Folder Already Exists");

    await ctx.db.insert("files", {
      projectId: args.projectId,
      name: args.name,
      parentId: args.parentId,
      type: "folder",
      updatedAt: Date.now(),
    });

    await ctx.db.patch("projects", args.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const renameFile = mutation({
  args: { id: v.id("files"), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const file = await ctx.db.get("files", args.id);
    if (!file) throw new ConvexError("File Not Found");

    const project = await ctx.db.get("projects", file.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    const siblings = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId),
      )
      .collect();

    const existingFile = siblings.find(
      (sibling) =>
        sibling.name === args.name &&
        sibling.type === file.type &&
        sibling._id !== args.id,
    );

    if (existingFile) {
      throw new ConvexError(
        `A ${file.type} with this name already exist in this location`,
      );
    }

    await ctx.db.patch("files", args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

async function deleteRecursive({
  fileId,
  ctx,
}: {
  fileId: Id<"files">;
  ctx: MutationCtx;
}) {
  const item = await ctx.db.get("files", fileId);
  if (!item) return;

  // if folder delete all children
  if (item.type === "folder") {
    const children = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", item.projectId).eq("parentId", item._id),
      )
      .collect();

    for (const child of children) {
      await deleteRecursive({ fileId: child._id, ctx });
    }
  }
  //delete storage file
  if (item.storageId) {
    await ctx.storage.delete(item.storageId);
  }

  // delete the item itself
  await ctx.db.delete("files", fileId);
}

export const deleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const file = await ctx.db.get("files", args.id);
    if (!file) throw new ConvexError("File Not Found");

    const project = await ctx.db.get("projects", file.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    await deleteRecursive({ fileId: args.id, ctx });
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const updateFile = mutation({
  args: {
    id: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const file = await ctx.db.get("files", args.id);
    if (!file) throw new ConvexError("File Not Found");

    const project = await ctx.db.get("projects", file.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    const now = Date.now();

    await ctx.db.patch("files", args.id, {
      content: args.content,
      updatedAt: now,
    });

    await ctx.db.patch("projects", file.projectId, {
      updatedAt: now,
    });
  },
});

export const getFilePath = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await isAuthenticated(ctx);

    const file = await ctx.db.get("files", args.id);
    if (!file) throw new ConvexError("File Not Found");

    const project = await ctx.db.get("projects", file.projectId);
    if (!project) throw new ConvexError("Project Not Found");

    if (project.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized to access this project");

    const path: { _id: Id<"files">; name: string }[] = [];
    let currentId: Id<"files"> | undefined = args.id;

    while (currentId) {
      const file = (await ctx.db.get("files", currentId)) as
        | Doc<"files">
        | undefined;

      if (!file) break;

      path.unshift({ _id: file._id, name: file.name });
      currentId = file.parentId;
    }

    return path;
  },
});
