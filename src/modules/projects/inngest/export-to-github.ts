import ky from "ky";
import { Octokit } from "octokit";
import { NonRetriableError } from "inngest";

import { inngest } from "@/inngest/client";
import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

interface ExportToGithub {
  projectId: Id<"projects">;
  repoName: string;
  visibility: "public" | "private";
  description?: string;
  githubToken: string;
}

type FileWithUrl = Doc<"files"> & { storageUrl: string | null };

type Blob = { path: string; mode: "100644"; type: "blob"; sha: string };

export const exportToGithub = inngest.createFunction(
  {
    id: "export-to-github",
    cancelOn: [
      {
        event: "github/export.cancel",
        if: "event.data.projectId == async.data.projectId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const internalKey = process.env.CONVEX_INTERNAL_KEY;
      if (!internalKey) return;

      const { projectId } = event.data.event.data as ExportToGithub;

      await step.run("set-failed-status", async () => {
        await convexClient.mutation(api.system.updateExportStatus, {
          internalKey,
          projectId,
          status: "failed",
        });
      });
    },
  },
  { event: "github/export.repo" },

  async ({ event, step }) => {
    const { repoName, projectId, description, visibility, githubToken } =
      event.data as ExportToGithub;

    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError("Internal Key required");
    }

    await step.run("set-export-status", async () => {
      await convexClient.mutation(api.system.updateExportStatus, {
        internalKey,
        projectId,
        status: "exporting",
      });
    });

    const octokit = new Octokit({ auth: githubToken });
    const { data: user } = await step.run("get-github-user", async () => {
      return await octokit.rest.users.getAuthenticated();
    });

    const { data: repo } = await step.run("create-repo", async () => {
      return await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: description || "Exported from synth",
        private: visibility === "private",
        auto_init: true,
      });
    });

    // waiting for github to initialize repo
    await step.sleep("wait-for-repo-init", "3s");

    //intial commit SHA
    const intialCommitSha = await step.run("get-initial-commit", async () => {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: user.login,
        repo: repoName,
        ref: "heads/main",
      });

      return ref.object.sha;
    });

    // fetch all project files with storage urls
    const files = await step.run("fetch-project-files", async () => {
      return (await convexClient.query(api.system.getProjectFilesWithUrls, {
        internalKey,
        projectId,
      })) as FileWithUrl[];
    });

    // map of file ids to their full paths
    const filePaths = buildFilePaths(files);

    // filter only files
    const fileEnteries = Object.entries(filePaths).filter(
      ([, file]) => file.type === "file",
    );

    if (fileEnteries.length === 0) {
      throw new NonRetriableError("No files to export");
    }

    // blobs for each file
    const treeItems = await step.run("create-blobs", async () => {
      const items: Blob[] = [];

      for (const [path, file] of fileEnteries) {
        let content: string;
        let encoding: "utf-8" | "base64" = "utf-8";

        if (file.content !== undefined) {
          content = file.content;
        } else if (file.storageUrl) {
          const res = await ky.get(file.storageUrl);
          const buffer = Buffer.from(await res.arrayBuffer());
          content = buffer.toString("base64");
          encoding = "base64";
        } else {
          continue;
        }

        const { data: blob } = await octokit.rest.git.createBlob({
          owner: user.login,
          repo: repoName,
          content,
          encoding,
        });

        items.push({ path, mode: "100644", type: "blob", sha: blob.sha });
      }

      return items;
    });

    if (treeItems.length === 0) {
      throw new NonRetriableError("Failed to create any blob");
    }

    // create tree
    const { data: tree } = await step.run("create-tree", async () => {
      return octokit.rest.git.createTree({
        owner: user.login,
        repo: repoName,
        tree: treeItems,
      });
    });

    // create commit with the initial commit as parent
    const { data: commit } = await step.run("create-commit", async () => {
      return await octokit.rest.git.createCommit({
        owner: user.login,
        repo: repoName,
        message: "Initial commit from synth",
        tree: tree.sha,
        parents: [intialCommitSha],
      });
    });

    //update the main branch reference to point to the new commit
    await step.run("update-branch-ref", async () => {
      return await octokit.rest.git.updateRef({
        owner: user.login,
        repo: repoName,
        ref: "heads/main",
        sha: commit.sha,
        force: true,
      });
    });

    await step.run("set-completed-status", async () => {
      return await convexClient.mutation(api.system.updateExportStatus, {
        internalKey,
        projectId,
        status: "exported",
        exportRepoUrl: repo.html_url,
      });
    });

    return {
      success: true,
      repoUrl: repo.html_url,
      filesExported: treeItems.length,
    };
  },
);

function buildFilePaths(files: FileWithUrl[]) {
  const filesMap = new Map<Id<"files">, FileWithUrl>();
  files.forEach((f) => filesMap.set(f._id, f));
  const paths: Record<string, FileWithUrl> = {};

  files.forEach((file) => {
    const fullPath = getFullPath({ file, fileMap: filesMap });
    paths[fullPath] = file;
  });

  return paths;
}

function getFullPath({
  file,
  fileMap,
}: {
  file: FileWithUrl;
  fileMap: Map<Id<"files">, FileWithUrl>;
}): string {
  if (!file.parentId) return file.name;

  const parent = fileMap.get(file.parentId);
  if (!parent) return file.name;

  return `${getFullPath({ file: parent, fileMap })}/${file.name}`;
}
