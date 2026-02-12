import { openai } from "@inngest/agent-kit";

export function groq(config: { model: string; apiKey: string }) {
  return openai({
    model: config.model,
    apiKey: config.apiKey,
    baseUrl: "https://api.groq.com/openai/v1",
    defaultParameters: {
      max_completion_tokens: 16000,
    },
  });
}
