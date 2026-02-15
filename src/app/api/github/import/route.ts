import { z } from "zod/v4";
import { NextResponse } from "next/server";

import { convexClient } from "@/lib/convex-client";
import { isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

const requestSchema = z.object({
  url: z.url(),
});

function parseGithubUrl(url: string) {
  const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/.*)?$/);
  if (!match) throw new Error("Invalid github url");

  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function POST(request: Request) {
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = request.json();
  const { url } = requestSchema.parse(body);

  const { owner, repo } = parseGithubUrl(url);

  const loggedInUserId = (await convexClient.query(api.auth.getCurrentUser, {}))
    .authUser._id;

  const account = await convexClient.query(api.auth.getUserAccount, {
    userId: loggedInUserId,
  });

  const githubToken = account.accessToken;

  return NextResponse.json({ githubToken });
}
