import { z } from "zod/v4";
import { createTool } from "@inngest/agent-kit";

import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface DeleteFileToolOptions {
  internalKey: string;
}

const paramSchema = z.object({
  fileId: z.string().describe("File or folder id to delete"),
});

export function deleteFileTool({ internalKey }: DeleteFileToolOptions) {
  return createTool({
    name: "deleteFile",
    description:
      "Delete a file or folder from the project. If a folder is provided, all nested items are deleted recursively.",
    parameters: z.object({
      fileId: z.string().describe("File or folder id to delete"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramSchema.safeParse(params);

      if (!parsed.success) {
        return `Error ${parsed.error.issues[0].message}`;
      }

      const { fileId } = parsed.data;

      const file = await convexClient.query(api.system.getFileById, {
        internalKey,
        fileId: fileId as Id<"files">,
      });

      if (!file) {
        return `Error, file id with ${fileId} not found. Use listFiles to get valid fileIds`;
      }

      try {
        return await toolStep?.run("delete-file", async () => {
          await convexClient.mutation(api.system.deleteFile, {
            internalKey,
            fileId: fileId as Id<"files">,
          });

          return `Deleted ${file.type} ${file.name} (${fileId})`;
        });
      } catch (error) {
        return `Error deleting file ${error instanceof Error ? error.message : error}`;
      }
    },
  });
}
