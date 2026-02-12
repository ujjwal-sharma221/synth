import { z } from "zod/v4";
import { createTool } from "@inngest/agent-kit";

import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface UpdateFileToolOptions {
  internalKey: string;
}

const paramSchema = z.object({
  fileId: z.string().describe("File id to update"),
  content: z.string().describe("Content to update"),
});

export function createUpdateFileTool({ internalKey }: UpdateFileToolOptions) {
  return createTool({
    name: "updateFile",
    description: "update the content of files from the project",
    parameters: z.object({
      fileId: z.string().describe("File id to update"),
      content: z.string().describe("Content to update"),
    }),

    handler: async (params, { step: toolStep }) => {
      const parsed = paramSchema.safeParse(params);

      if (!parsed.success) {
        return `Error ${parsed.error.issues[0].message}`;
      }

      const { fileId, content } = parsed.data;

      const file = await convexClient.query(api.system.getFileById, {
        internalKey,
        fileId: fileId as Id<"files">,
      });

      if (!file) {
        return `Error, file id with ${fileId} not found. Use listFiles to get valid fileIds`;
      }

      if (file.type === "folder") {
        return `Error, file id with ${fileId} is a folder. Use listFiles to get valid fileIds`;
      }

      try {
        return await toolStep?.run("update-file", async () => {
          await convexClient.mutation(api.system.updateFileContent, {
            internalKey,
            fileId: fileId as Id<"files">,
            content,
          });

          return `File with id ${fileId} and name ${file.name} updated successfully`;
        });
      } catch (error) {
        return `Error updating files ${error instanceof Error ? error.message : error}`;
      }
    },
  });
}
