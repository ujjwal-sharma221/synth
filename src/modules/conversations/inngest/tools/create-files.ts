import { z } from "zod/v4";
import { createTool } from "@inngest/agent-kit";

import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface CreateFilesToolOptions {
  internalKey: string;
  projectId: Id<"projects">;
}

const singleFileParamSchema = z.object({
  parentId: z.string(),
  name: z.string(),
  content: z.string(),
});

const paramSchema = z.object({
  parentId: z.string(),
  files: z.array(z.object({ name: z.string(), content: z.string() })),
});

export function createFilesTool({
  internalKey,
  projectId,
}: CreateFilesToolOptions) {
  return createTool({
    name: "createFiles",
    description:
      "Create one or more new files within a specific folder in the project. Requires the parent folder ID and a list of files including their names and contents.",

    parameters: z.object({
      parentId: z
        .string()
        .describe(
          "Parent folder ID. Use empty folder for root level. Must be a valid folder id from listFiles tool",
        ),
      files: z.array(
        z.object({
          name: z.string().describe("the file name including extension"),
          content: z.string().describe("the file content"),
        }),
      ),
    }),

    handler: async (params, { step: toolStep }) => {
      const parsed = paramSchema.safeParse(params);

      if (!parsed.success) {
        return `Error ${parsed.error.issues[0].message}`;
      }

      const { parentId, files } = parsed.data;

      return await toolStep?.run("create-files", async () => {
        let resolvedParentId: Id<"files"> | undefined;

        if (parentId !== "") {
          const parentFolder = await convexClient.query(api.system.getFileById, {
            internalKey,
            fileId: parentId as Id<"files">,
          });

          if (!parentFolder) {
            return `Error, parent folder with id ${parentId} not found. Use listFiles to get valid folderIds`;
          }

          if (parentFolder.type !== "folder") {
            return `Error, parent folder with id ${parentId} is not a folder. Use listFiles to get valid folderIds`;
          }

          resolvedParentId = parentId as Id<"files">;
        }

        try {
          const results = await convexClient.mutation(api.system.createFiles, {
            internalKey,
            projectId,
            parentId: resolvedParentId,
            files,
          });

          const created = results.filter((r) => !r.error);
          const failed = results.filter((r) => r.error);

          let response = `created ${created.length} file(s)`;

          if (created.length > 0) {
            response += ` :${created.map((c) => c.name).join(", ")}`;
          }

          if (failed.length > 0) {
            response += `. failed ${failed.length} file(s)`;
          }

          return response;
        } catch (error) {
          return `Error creating files ${error instanceof Error ? error.message : error}`;
        }
      });
    },
  });
}

export function createFileTool({ internalKey, projectId }: CreateFilesToolOptions) {
  return createTool({
    name: "createFile",
    description:
      "Create a single new file in the project. Supports root-level creation with an empty parentId.",
    parameters: z.object({
      parentId: z
        .string()
        .describe(
          "Parent folder ID. Use empty folder for root level. Must be a valid folder id from listFiles tool",
        ),
      name: z.string().describe("the file name including extension"),
      content: z.string().describe("the file content"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = singleFileParamSchema.safeParse(params);

      if (!parsed.success) {
        return `Error ${parsed.error.issues[0].message}`;
      }

      const { parentId, name, content } = parsed.data;

      return await toolStep?.run("create-file", async () => {
        let resolvedParentId: Id<"files"> | undefined;

        if (parentId !== "") {
          const parentFolder = await convexClient.query(api.system.getFileById, {
            internalKey,
            fileId: parentId as Id<"files">,
          });

          if (!parentFolder) {
            return `Error, parent folder with id ${parentId} not found. Use listFiles to get valid folderIds`;
          }

          if (parentFolder.type !== "folder") {
            return `Error, parent folder with id ${parentId} is not a folder. Use listFiles to get valid folderIds`;
          }

          resolvedParentId = parentId as Id<"files">;
        }

        try {
          const result = await convexClient.mutation(api.system.createFile, {
            internalKey,
            projectId,
            parentId: resolvedParentId,
            name,
            content,
          });

          return `created file ${name} (${result})`;
        } catch (error) {
          return `Error creating file ${error instanceof Error ? error.message : error}`;
        }
      });
    },
  });
}
