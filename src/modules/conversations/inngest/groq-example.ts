import { createAgent } from "@inngest/agent-kit";
import { groq } from "./groq-model-provider";

/**
 * Example: Using Groq with @inngest/agent-kit
 *
 * This file demonstrates how to create agents using the Groq model provider.
 */

// Available Groq Models:
// - llama-3.3-70b-versatile (Recommended - Fast, high-quality responses)
// - llama-3.1-70b-versatile (Balanced performance)
// - llama-3.1-8b-instant (Fastest, good for simple tasks)
// - mixtral-8x7b-32768 (Large context window - 32k tokens)
// - gemma2-9b-it (Lightweight and fast)

// Example 1: Simple coding assistant
const codingAgent = createAgent({
  name: "groq-coding-assistant",
  system:
    "You are a helpful coding assistant. Provide clear, concise code examples.",
  model: groq({
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY!,
  }),
});

// Example 2: Title generator (like in your process-message.ts)
const titleAgent = createAgent({
  name: "title-generator",
  system:
    "Generate a short, descriptive title (max 50 characters) for the conversation.",
  model: groq({
    model: "llama-3.1-8b-instant", // Use faster model for simple tasks
    apiKey: process.env.GROQ_API_KEY!,
  }),
});

// Example 3: Using with tools
const agentWithTools = createAgent({
  name: "groq-agent-with-tools",
  system: "You are a helpful assistant with access to tools.",
  model: groq({
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY!,
  }),
  tools: [
    // Add your tools here
  ],
});

// Example usage in an Inngest function:
// const { output } = await codingAgent.run(message, { step });
