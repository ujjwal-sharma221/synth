import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";
import { exportToGithub } from "@/modules/projects/inngest/export-to-github";
import { processMessage } from "@/modules/conversations/inngest/process-message";
import { importGithubRepo } from "@/modules/projects/inngest/import-github-repo";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, processMessage, importGithubRepo, exportToGithub],
});
