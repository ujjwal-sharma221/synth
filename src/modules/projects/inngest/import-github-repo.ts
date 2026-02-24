import ky from "ky";
import { Octokit } from "octokit";
import { isBinaryFile } from "isbinaryfile";
import { NonRetriableError } from "inngest";

import { inngest } from "@/inngest/client";
import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface ImportGithubRepoEvent {
  owner: string;
  repo: string;
  projectId: Id<"projects">;
  githubToken: string;
}

export const importGithubRepo = inngest.createFunction(
  {
    id: "import-github-repo",
    onFailure: async ({ event, step }) => {
      const internalKey = process.env.CONVEX_INTERNAL_KEY;
      if (!internalKey) return;

      const { projectId } = event.data.event.data as ImportGithubRepoEvent;

      await step.run("set-failed-status", async () => {
        await convexClient.mutation(api.system.updateImportStatus, {
          internalKey,
          projectId,
          status: "failed",
        });
      });
    },
  },

  { event: "github/import.repo" },

  async ({ event, step }) => {
    const { projectId, owner, repo, githubToken } =
      event.data as ImportGithubRepoEvent;

    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError("Internal Key required");
    }

    const octokit = new Octokit({ auth: githubToken });

    // cleanup existing files
    await step.run("cleanup-project", async () => {
      await convexClient.mutation(api.system.cleanup, {
        internalKey,
        projectId,
      });
    });

    const tree = await step.run("fetch-repo-tree", async () => {
      try {
        const { data } = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: "main",
          recursive: "1",
        });

        return data;
      } catch (err) {
        console.log(err);
        const { data } = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: "master",
          recursive: "1",
        });

        return data;
      }
    });

    const folders = tree.tree
      .filter((item) => item.type === "tree" && item.path)
      .sort((a, b) => {
        const aDepth = a.path ? a.path.split("/").length : 0;
        const bDepth = b.path ? b.path.split("/").length : 0;

        return aDepth - bDepth;
      });

    const folderIdMap = (await step.run("create-folders", async () => {
      const map: Record<string, Id<"files">> = {};

      for (const folder of folders) {
        if (!folder.path) return;

        const pathParts = folder.path.split("/");
        const name = pathParts.pop()!;
        const parentPath = pathParts.join("/");
        const parentId = parentPath ? map[parentPath] : undefined;

        const folderId = await convexClient.mutation(api.system.createFolder, {
          internalKey,
          name,
          parentId,
          projectId,
        });

        map[folder.path] = folderId;
      }

      return map;
    })) as Record<string, Id<"files">>;

    // get all files (blob) from tree
    const allFiles = tree.tree.filter(
      (item) => item.type === "blob" && item.sha && item.path,
    );

    await step.run("create-files", async () => {
      for (const file of allFiles) {
        if (!file.path || !file.sha) continue;

        try {
          const { data: blob } = await octokit.rest.git.getBlob({
            owner,
            repo,
            file_sha: file.sha,
          });

          const buffer = Buffer.from(blob.content, "base64");
          const isBinary = await isBinaryFile(buffer);

          const pathParts = file.path.split("/");
          const name = pathParts.pop()!;
          const parentPath = pathParts.join("/");
          const parentId = parentPath ? folderIdMap[parentPath] : undefined;

          if (isBinary) {
            const uploadUrl = await convexClient.mutation(
              api.system.generateUploadUrl,
              { internalKey },
            );

            const { storageId } = await ky
              .post(uploadUrl, {
                headers: { "Content-Type": "application/octet-stream" },
                body: buffer,
              })
              .json<{ storageId: Id<"_storage"> }>();

            await convexClient.mutation(api.system.createBinaryFile, {
              internalKey,
              projectId,
              name,
              parentId,
              storageId,
            });
          } else {
            const content = buffer.toString("utf-8");
            await convexClient.mutation(api.system.createFile, {
              internalKey,
              projectId,
              parentId,
              name,
              content,
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    });

    await step.run("set-completed-status", async () => {
      await convexClient.mutation(api.system.updateImportStatus, {
        internalKey,
        status: "imported",
        projectId,
      });
    });

    return { success: true, projectId };
  },
);
