import { v } from "convex/values";
import { defineTable, defineSchema } from "convex/server";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    ownerId: v.string(),
    importStatus: v.optional(
      v.union(
        v.literal("importing"),
        v.literal("imported"),
        v.literal("failed"),
      ),
    ),
    exportStatus: v.optional(
      v.union(
        v.literal("exporting"),
        v.literal("exported"),
        v.literal("failed"),
      ),
    ),
    exportRepoUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),
});
