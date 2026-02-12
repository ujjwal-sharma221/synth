import { z } from "zod/v4";
import { createTool } from "@inngest/agent-kit";

import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface ListFileToolOptions {
  internalKey: string;
  projectId: Id<"projects">;
}

const paramSchema = z.object({
  fileIds: z
    .array(z.string().min(1, "File ID is required"))
    .min(1, "At least one file ID is required"),
});

export function listFiles({ internalKey, projectId }: ListFileToolOptions) {
  return createTool({
    name: "listFiles",
    description:
      "list the files in the project and return the file contents. Return the file ids, names, type and content parentId for each of the item. Items with parentId:null are at the root level. Use the parentId to understand the folder structure - items with same parentId are siblings",
    parameters: z.object({}),

    handler: async (_, { step: toolStep }) => {
      try {
        return await toolStep?.run("list-files", async () => {
          const files = await convexClient.query(api.system.getProjectFiles, {
            internalKey,
            projectId,
          });

          // folders first and files (a-z)
          const sorted = files.sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "folder" ? -1 : 1;
            }

            return a.name.localeCompare(b.name);
          });

          const fileList = sorted.map((file) => {
            return {
              id: file._id,
              name: file.name,
              type: file.type,
              parentId: file.parentId ?? null,
            };
          });

          return JSON.stringify(fileList);
        });
      } catch (error) {
        return `Error listing files ${error instanceof Error ? error.message : error}`;
      }
    },
  });
}
