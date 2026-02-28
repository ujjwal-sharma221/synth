import { z } from "zod/v4";
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  projectId: z.string(),
  repoName: z.string().min(1),
  visibility: z.enum(["public", "private"]).default("private"),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, visibility, description, repoName } =
    requestSchema.parse(body);

  const { authUser } = await fetchAuthQuery(api.auth.getCurrentUser, {});
  const loggedInUserId = authUser._id;

  const account = await fetchAuthQuery(api.auth.getUserAccount, {
    userId: loggedInUserId,
    providerId: "github",
  });

  const githubToken = account?.accessToken;

  if (!githubToken) {
    return NextResponse.json(
      {
        code: "GITHUB_AUTH_REQUIRED",
        error: "Github token is required, please reconnect your github account",
      },
      { status: 400 },
    );
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

  inngest.send({
    name: "github/export.repo",
    data: {
      projectId: projectId as Id<"projects">,
      repoName,
      visibility,
      description,
      githubToken,
      internalKey,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
