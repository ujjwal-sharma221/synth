import { z } from "zod/v4";
import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth-server";
import { convexClient } from "@/lib/convex-client";
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

  const internalKey = process.env.CONVEX_INTERNAL_KEY;
  if (!internalKey) {
    return NextResponse.json(
      {
        error: "Internal key is required",
      },
      { status: 500 },
    );
  }

  await convexClient.mutation(api.system.updateExportStatus, {
    internalKey,
    projectId: projectId as Id<"projects">,
    status: undefined,
    exportRepoUrl: undefined,
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
