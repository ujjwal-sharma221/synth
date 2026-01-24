import z from "zod/v4";
import { NextResponse } from "next/server";

import { inngest } from "@/inngest/client";
import { convexClient } from "@/lib/convex-client";
import { isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  message: z.string(),
  conversationId: z.string(),
});

export async function POST(req: Request) {
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { conversationId, message } = requestSchema.parse(body);

  const conversation = await convexClient.query(
    api.system.getConversationById,
    {
      conversationId: conversationId as Id<"conversations">,
      internalKey: process.env.CONVEX_INTERNAL_KEY!,
    },
  );

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const projectId = conversation.projectId;

  await convexClient.mutation(api.system.createMessage, {
    internalKey: process.env.CONVEX_INTERNAL_KEY!,
    projectId,
    conversationId: conversationId as Id<"conversations">,
    role: "user",
    content: message,
  });

  const assistantMessageId = await convexClient.mutation(
    api.system.createMessage,
    {
      internalKey: process.env.CONVEX_INTERNAL_KEY!,
      projectId,
      conversationId: conversationId as Id<"conversations">,
      role: "assistant",
      content: "",
      status: "processing",
    },
  );

  const event = await inngest.send({
    name: "message/sent",
    data: {
      messageId: assistantMessageId,
    },
  });

  return NextResponse.json({
    success: true,
    eventId: event.ids[0],
    messageId: assistantMessageId,
  });
}
