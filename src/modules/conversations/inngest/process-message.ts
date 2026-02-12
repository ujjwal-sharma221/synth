import { NonRetriableError } from "inngest";
import { createAgent, createNetwork } from "@inngest/agent-kit";

import {
  CODING_AGENT_SYSTEM_PROMPT,
  CONVERSATION_TITLE_AGENT_SYSTEM_PROMPT,
} from "./constants";
import { inngest } from "@/inngest/client";
import { groq } from "./groq-model-provider";
import { listFiles } from "./tools/list-files";
import { readFileTool } from "./tools/read-file";
import { convexClient } from "@/lib/convex-client";
import { createFilesTool } from "./tools/create-files";
import { api } from "../../../../convex/_generated/api";
import { createFolderTool } from "./tools/create-folder";
import { createUpdateFileTool } from "./tools/update-files";
import { deleteFileTool } from "./tools/delete-file";
import { renameFileTool } from "./tools/rename-file";
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

    const contextMessages = recentMessages.filter(
      (msg) => msg._id !== messageId && msg.content.trim() !== "",
    );

    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;

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

    const codingAgent = createAgent({
      name: "synth",
      description: "Expert ai coding agent",
      system: systemPrompt,
      model: groq({
        model: "openai/gpt-oss-120b",
        apiKey: process.env.GROQ_API_KEY!,
      }),

      tools: [
        listFiles({ internalKey, projectId }),
        readFileTool({ internalKey }),
        createUpdateFileTool({ internalKey }),
        renameFileTool({ internalKey }),
        deleteFileTool({ internalKey }),
        createFilesTool({ internalKey, projectId }),
        createFilesTool({ internalKey, projectId }),
        createFolderTool({ internalKey, projectId }),
      ],
    });

    const network = createNetwork({
      name: "synth-network",
      agents: [codingAgent],
      maxIter: 20,
      router: ({ network }) => {
        const lastResult = network.state.results.at(-1);

        if (!lastResult) {
          return codingAgent;
        }

        const hasText = lastResult.output.some(
          (m) => m.type === "text" && m.role === "assistant",
        );

        const hasToolCallOrResult = lastResult.output.some(
          (m) => m.type === "tool_call" || m.type === "tool_result",
        );

        if (hasText || !hasToolCallOrResult) {
          return undefined;
        }

        return codingAgent;
      },
    });

    const result = await network.run(message);

    const lastResult = result.state.results.at(-1);

    const textMessage = lastResult?.output.find(
      (m) => m.type === "text" && m.role === "assistant",
    );

    console.log("TEXT_MESSAGE", textMessage);

    let defaultResponse = "Your request is processed successfully";

    if (textMessage?.type === "text") {
      defaultResponse =
        typeof textMessage.content === "string"
          ? textMessage.content
          : textMessage.content.map((c) => c.text).join("");
    }

    await step.run("update-assisstant-message", async () => {
      await convexClient.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: defaultResponse,
      });
    });

    return { success: true, messageId, conversationId };
  },
);
