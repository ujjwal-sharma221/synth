import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST() {
  const res = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: "Write me any recipe",
  });

  return NextResponse.json({ res });
}
