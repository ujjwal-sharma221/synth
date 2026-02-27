import { z } from "zod/v4";
import { NextResponse } from "next/server";

import { inngest } from "@/inngest/client";
import { generateUniqueName } from "@/lib/utils";
import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../../convex/constants";

const requestSchema = z.object({
  prompt: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalKey = process.env.CONVEX_INTERNAL_KEY;
  if (!internalKey) {
    return NextResponse.json(
      {
        error: "Internal key is required",
      },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { prompt } = requestSchema.parse(body);

  const projectName = generateUniqueName();

  const { authUser } = await fetchAuthQuery(api.auth.getCurrentUser, {});
  const loggedInUserId = authUser._id;

  const { projectId, conversationId } = await convexClient.mutation(
    api.system.createProjectWithConversation,
    {
      internalKey,
      projectName,
      conversationTitle: DEFAULT_CONVERSATION_TITLE,
      ownerId: loggedInUserId,
    },
  );

  // user message
  await convexClient.mutation(api.system.createMessage, {
    internalKey,
    conversationId,
    projectId,
    role: "user",
    content: prompt,
  });

  // placeholder assistant message
  const assistantMessageId = await convexClient.mutation(
    api.system.createMessage,
    {
      internalKey,
      conversationId,
      projectId,
      role: "assistant",
      content: "",
      status: "processing",
    },
  );

  await inngest.send({
    name: "message/sent",
    data: {
      messageId: assistantMessageId,
      conversationId,
      projectId,
      message: prompt,
    },
  });

  return NextResponse.json({ projectId });
}
