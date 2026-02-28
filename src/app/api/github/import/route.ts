import { z } from "zod/v4";
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

import { parseGithubUrl } from "@/lib/utils";
import { convexClient } from "@/lib/convex-client";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

const requestSchema = z.object({
  url: z.url(),
});

export async function POST(request: Request) {
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url } = requestSchema.parse(body);

  const { owner, repo } = parseGithubUrl(url);

  const { authUser } = await fetchAuthQuery(api.auth.getCurrentUser, {});
  const loggedInUserId = authUser._id;

  const account = await fetchAuthQuery(api.auth.getUserAccount, {
    userId: loggedInUserId,
    providerId: "github",
  });

  const githubToken = account?.accessToken;
  console.log("GITHUB_TOKEN", githubToken);

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

  const projectId = await convexClient.mutation(api.system.createProject, {
    internalKey,
    name: repo,
    ownerId: loggedInUserId,
  });

  await inngest.send({
    name: "github/import.repo",
    data: {
      owner,
      repo,
      projectId,
      githubToken,
    },
  });

  return NextResponse.json({ success: true, projectId }, { status: 200 });
}
