import { NonRetriableError } from "inngest";
import { createAgent, gemini, openai, createTool } from "@inngest/agent-kit";
import { groq } from "./groq-model-provider";

import {
  CODING_AGENT_SYSTEM_PROMPT,
  CONVERSATION_TITLE_AGENT_SYSTEM_PROMPT,
} from "./constants";
import { inngest } from "@/inngest/client";
import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../convex/constants";

interface MessageEvent {
  messageId: Id<"messages">;
  conversationId: Id<"conversations">;
  projectId: Id<"projects">;
  message: string;
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
    const { messageId, conversationId, projectId, message } =
      event.data as MessageEvent;

    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) throw new NonRetriableError("Internal key not found");

    await step.sleep("wait-for-db-sync", "1s");

    const conversation = await step.run("get-conversation", async () => {
      return await convexClient.query(api.system.getConversationById, {
        internalKey,
        conversationId,
      });
    });

    if (!conversation) {
      throw new NonRetriableError("Conversation not found");
    }

    const recentMessages = await step.run("get-recent-messages", async () => {
      return await convexClient.query(api.system.getRecentMessages, {
        internalKey,
        conversationId,
        limit: 10,
      });
    });

    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;

    const contextMessages = recentMessages.filter(
      (msg) => msg._id !== messageId && msg.content.trim() !== "",
    );

    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map((msg) => {
          return `${msg.role.toUpperCase()}: ${msg.content}`;
        })
        .join("\n\n");

      systemPrompt += `\n\nCONVERSATION HISTORY:\n${historyText}\n\nRESPOND TO THE FOLLOWING USER MESSAGE: \n\n`;
    }

    const shouldGenerate = conversation.title === DEFAULT_CONVERSATION_TITLE;
    if (shouldGenerate) {
      const titleAgent = createAgent({
        name: "title-generator",
        system: CONVERSATION_TITLE_AGENT_SYSTEM_PROMPT,
        model: groq({
          model: "llama-3.1-8b-instant",
          apiKey: process.env.GROQ_API_KEY!,
        }),
      });

      const { output } = await titleAgent.run(message, { step });
      const textMessage = output.find(
        (m) => m.type === "text" && m.role === "assistant",
      );

      if (textMessage?.type === "text") {
        const title =
          typeof textMessage.content === "string"
            ? textMessage.content.trim()
            : textMessage.content
                .map((c) => c.text)
                .join("")
                .trim();

        if (title) {
          await step.run("update-conversation-title", async () => {
            await convexClient.mutation(api.system.updateConversationTitle, {
              internalKey,
              conversationId,
              title,
            });
          });
        }
      }
    }

    await step.run("update-assisstant-message", async () => {
      await convexClient.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: "AI processed this message",
      });
    });
  },
);
