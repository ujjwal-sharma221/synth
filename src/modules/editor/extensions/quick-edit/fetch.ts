import ky from "ky";
import { z } from "zod/v4";
import { toast } from "sonner";

const EditRequestSchema = z.object({
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
});

const EditResponseSchema = z.object({
  suggestion: z.string(),
});

type EditRequestPayload = z.infer<typeof EditRequestSchema>;
type EditResponse = z.infer<typeof EditResponseSchema>;

export async function fetchEdit(
  payload: EditRequestPayload,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const validatedPayload = EditRequestSchema.parse(payload);

    const response = await ky.post("/api/quick-edit", {
      json: validatedPayload,
      signal,
      timeout: 30_000,
      retry: 0,
    });

    const data = await response.json<EditResponse>();
    const validatedResponse = EditResponseSchema.parse(data);
    return validatedResponse.suggestion;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    console.error(error);
    toast.error("Failed to fetch edit");
    return null;
  }
}
