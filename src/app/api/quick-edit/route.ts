import { z } from "zod/v4";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { createCerebras } from "@ai-sdk/cerebras";

import { crawl } from "@/lib/firecrawl";
import { isAuthenticated } from "@/lib/auth-server";

const cerebras = createCerebras({
  apiKey: process.env.CEREBRAS_API_KEY as string,
});

const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.
<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

const QuickEditSchema = z.object({
  editedCode: z.string().describe("Edited version of the selected code"),
});

const URL_REGEX = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

export async function POST(request: Request) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { selectedCode, fullCode, instruction } = await request.json();
    if (!selectedCode) {
      return NextResponse.json(
        { error: "No selected code provided" },
        { status: 400 },
      );
    }

    if (!instruction) {
      return NextResponse.json(
        { error: "No instruction provided" },
        { status: 400 },
      );
    }

    const urls: string[] = instruction.match(URL_REGEX) || [];

    let documentContext = "";
    if (urls.length > 0) {
      const scrapedResult = await Promise.all(
        urls.map(async (url) => {
          try {
            const res = await crawl.scrape(url, {
              formats: ["markdown"],
            });

            if (res.markdown) {
              return `
              <document>
              <url>${url}</url>
              <markdown>${res.markdown}</markdown>
              </document>
              `;
            }

            return null;
          } catch (error) {
            console.log(error);
            return null;
          }
        }),
      );

      documentContext = scrapedResult.filter(Boolean).join("\n");
    }

    const prompt = QUICK_EDIT_PROMPT.replace("{selectedCode}", selectedCode)
      .replace("{fullCode}", fullCode || "")
      .replace("{instruction}", instruction)
      .replace("{documentation}", documentContext);

    const { output } = await generateText({
      model: cerebras("llama3.1-8b"),
      output: Output.object({ schema: QuickEditSchema }),
      prompt,
    });

    return NextResponse.json({ editedCode: output.editedCode });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
