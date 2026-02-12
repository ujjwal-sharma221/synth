import { z } from "zod/v4";
import { createTool } from "@inngest/agent-kit";

import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface ReadFileToolOptions {
  internalKey: string;
}

const paramSchema = z.object({
  fileIds: z
    .array(z.string().min(1, "File ID is required"))
    .min(1, "At least one file ID is required"),
});

export function readFileTool({ internalKey }: ReadFileToolOptions) {
  return createTool({
    name: "readFiles",
    description:
      "read the content of files from the project and return the file contents",
    parameters: z.object({
      fileIds: z.array(z.string()).describe("Array of file ids to read"),
    }),

    handler: async (params, { step: toolStep }) => {
      const parsed = paramSchema.safeParse(params);

      if (!parsed.success) {
        return `Error ${parsed.error.issues[0].message}`;
      }

      const { fileIds } = parsed.data;

      try {
        return await toolStep?.run("read-files", async () => {
          const results: { id: string; name: string; content: string }[] = [];

          for (const fileId of fileIds) {
            const file = await convexClient.query(api.system.getFileById, {
              internalKey,
              fileId: fileId as Id<"files">,
            });

            if (file && file.type === "file") {
              results.push({
                id: file._id,
                name: file.name,
                content: file.content ?? "",
              });
            }
          }

          if (results.length === 0) {
            return "Error, no files found with provided ids. Use listFiles to get valid fileIds";
          }

          return JSON.stringify(results);
        });
      } catch (error) {
        return `Error reading files ${error instanceof Error ? error.message : error}`;
      }
    },
  });
}
