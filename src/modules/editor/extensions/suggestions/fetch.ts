import ky from "ky";
import { z } from "zod/v4";
import { toast } from "sonner";

const SuggestionSchema = z.object({
  fileName: z.string(),
  code: z.string(),
  currentLine: z.string(),
  previousLines: z.string(),
  textBeforeCursor: z.string(),
  textAfterCursor: z.string(),
  nextLines: z.string(),
  lineNumber: z.number(),
});

const SuggestionResponseSchema = z.object({
  suggestion: z.string(),
});

type SuggestionPayload = z.infer<typeof SuggestionSchema>;
type SuggestionResponse = z.infer<typeof SuggestionResponseSchema>;

export async function fetchSuggestions(
  payload: SuggestionPayload,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const validatedPayload = SuggestionSchema.parse(payload);

    const response = await ky.post("/api/suggestions", {
      json: validatedPayload,
      signal,
      timeout: 10_000,
      retry: 0,
    });

    const data = await response.json<SuggestionResponse>();
    const validatedResponse = SuggestionResponseSchema.parse(data);
    return validatedResponse.suggestion;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    console.error(error);
    toast.error("Failed to fetch suggestions");
    return null;
  }
}
