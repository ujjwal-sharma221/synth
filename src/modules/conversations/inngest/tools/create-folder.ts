import { z } from "zod/v4";
import { createTool } from "@inngest/agent-kit";

import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface CreateFolderToolOptions {
  internalKey: string;
  projectId: Id<"projects">;
}

const paramSchema = z.object({
  parentId: z.string().nullable(),
  name: z.string(),
});

export function createFolderTool({
  internalKey,
  projectId,
}: CreateFolderToolOptions) {
  return createTool({
    name: "createFolder",
    description: "Create a new folder in this project",

    parameters: z.object({
      parentId: z
        .string()
        .nullable()
        .describe(
          "Parent folder ID. Use empty string or null for root level. Must be a valid folder id from listFiles tool",
        ),
      name: z.string().describe("the folder name"),
    }),

    handler: async (params, { step: toolStep }) => {
      const parsed = paramSchema.safeParse(params);

      if (!parsed.success) {
        return `Error ${parsed.error.issues[0].message}`;
      }

      const { name, parentId } = parsed.data;
      const normalizedParentId = parentId ?? "";

      return await toolStep?.run("create-folder", async () => {
        let resolvedParentId: Id<"files"> | undefined;

        if (normalizedParentId !== "") {
          const parentFolder = await convexClient.query(api.system.getFileById, {
            internalKey,
            fileId: normalizedParentId as Id<"files">,
          });

          if (!parentFolder) {
            return `Error, parent folder with id ${normalizedParentId} not found. Use listFiles to get valid folderIds`;
          }

          if (parentFolder.type !== "folder") {
            return `Error, parent folder with id ${normalizedParentId} is not a folder. Use listFiles to get valid folderIds`;
          }

          resolvedParentId = normalizedParentId as Id<"files">;
        }

        try {
          const result = await convexClient.mutation(api.system.createFolder, {
            internalKey,
            projectId,
            parentId: resolvedParentId,
            name,
          });

          return `created folder ${result}`;
        } catch (error) {
          return `Error creating folder ${error instanceof Error ? error.message : error}`;
        }
      });
    },
  });
}
