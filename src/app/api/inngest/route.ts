import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";
import { processMessage } from "@/modules/conversations/inngest/process-message";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, processMessage],
});
