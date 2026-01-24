import { NonRetriableError } from "inngest";

import { inngest } from "@/inngest/client";
import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface MessageEvent {
  messageId: Id<"messages">;
}

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "message/cancel",
        if: "event.data.messageId == async.data.messageId",
      },
    ],

    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent;
      const internalKey = process.env.CONVEX_INTERNAL_KEY;

      if (!internalKey) return;

      await step.run("update-message-on-failure", async () => {
        await convexClient.mutation(api.system.updateMessageContent, {
          internalKey,
          messageId,
          content: "Message processing failed, please try again.",
        });
      });
    },
  },
  {
    event: "message/sent",
  },

  async ({ event, step }) => {
    const { messageId } = event.data as MessageEvent;

    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) throw new NonRetriableError("Internal key not found");

    await step.sleep("wait-for-ai-processing", "5s");

    await step.run("update-assisstant-message", async () => {
      await convexClient.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: "AI processed this message",
      });
    });
  },
);
