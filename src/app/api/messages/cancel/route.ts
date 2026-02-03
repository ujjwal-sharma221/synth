import z from "zod/v4";
import { NextResponse } from "next/server";

import { inngest } from "@/inngest/client";
import { convexClient } from "@/lib/convex-client";
import { isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  projectId: z.string(),
});

export async function POST(request: Request) {
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId } = requestSchema.parse(body);

  const internalKey = process.env.CONVEX_INTERNAL_KEY!;
  if (!internalKey) {
    return NextResponse.json(
      { error: "Internal key not configured" },
      { status: 500 },
    );
  }

  const processingMessages = await convexClient.query(
    api.system.getProcessingMessages,
    {
      internalKey,
      projectId: projectId as Id<"projects">,
    },
  );

  if (!processingMessages) {
    return NextResponse.json(
      { success: true, cancelled: false },
      { status: 200 },
    );
  }

  const cancelIds = await Promise.all(
    processingMessages.map(async (msg) => {
      await inngest.send({
        name: "message/cancel",
        data: {
          messageId: msg._id,
        },
      });

      await convexClient.mutation(api.system.updateMessageStatus, {
        internalKey,
        messageId: msg._id,
        status: "cancelled",
      });
    }),
  );

  return NextResponse.json({
    success: true,
    cancelled: true,
    messageIds: cancelIds,
  });
}
