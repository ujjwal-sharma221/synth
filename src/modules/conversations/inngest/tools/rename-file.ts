import { z } from "zod/v4";
import { createTool } from "@inngest/agent-kit";

import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface RenameFileToolOptions {
  internalKey: string;
}

const paramSchema = z.object({
  fileId: z.string().describe("File or folder id to rename"),
  name: z.string().min(1, "Name is required").describe("New file or folder name"),
});

export function renameFileTool({ internalKey }: RenameFileToolOptions) {
  return createTool({
    name: "renameFile",
    description:
      "Rename a file or folder in the project. Name must be unique among siblings.",
    parameters: z.object({
      fileId: z.string().describe("File or folder id to rename"),
      name: z.string().min(1).describe("New file or folder name"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramSchema.safeParse(params);

      if (!parsed.success) {
        return `Error ${parsed.error.issues[0].message}`;
      }

      const { fileId, name } = parsed.data;

      const file = await convexClient.query(api.system.getFileById, {
        internalKey,
        fileId: fileId as Id<"files">,
      });

      if (!file) {
        return `Error, file id with ${fileId} not found. Use listFiles to get valid fileIds`;
      }

      try {
        return await toolStep?.run("rename-file", async () => {
          await convexClient.mutation(api.system.renameFile, {
            internalKey,
            fileId: fileId as Id<"files">,
            name,
          });

          return `Renamed ${file.type} ${file.name} to ${name}`;
        });
      } catch (error) {
        return `Error renaming file ${error instanceof Error ? error.message : error}`;
      }
    },
  });
}
