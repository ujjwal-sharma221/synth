import { openai } from "@inngest/agent-kit";

/**
 * Create a Groq model provider for use with @inngest/agent-kit
 *
 * Groq is OpenAI-compatible, so we use the openai adapter with Groq's base URL
 *
 * @example
 * ```ts
 * const agent = createAgent({
 *   name: "my-agent",
 *   system: "You are a helpful assistant",
 *   model: groq({
 *     model: "llama-3.3-70b-versatile",
 *     apiKey: process.env.GROQ_API_KEY!,
 *   }),
 * });
 * ```
 */
export function groq(config: { model: string; apiKey: string }) {
  return openai({
    model: config.model,
    apiKey: config.apiKey,
    baseUrl: "https://api.groq.com/openai/v1",
  });
}
