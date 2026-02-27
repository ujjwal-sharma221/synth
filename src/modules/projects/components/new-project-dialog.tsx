"use client";

import ky from "ky";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Id } from "../../../../convex/_generated/dataModel";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({
  onOpenChange,
  open,
}: NewProjectDialogProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text) return;

    setIsSubmitting(true);

    try {
      const { projectId } = await ky
        .post("/api/projects/create-with-prompt", {
          json: { prompt: message.text.trim() },
        })
        .json<{ projectId: Id<"projects"> }>();

      toast.success("Project Created");
      onOpenChange(false);
      setInput("");
      router.push(`/projects/${projectId}`);
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong while creating project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg p-0">
        <DialogHeader className="hidden">
          <DialogTitle>What you want to build?</DialogTitle>
          <DialogDescription>
            Describe your project and ai will act on it
          </DialogDescription>
        </DialogHeader>

        <PromptInput onSubmit={handleSubmit} className="border-none!">
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Ask synth to build something"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              disabled={isSubmitting}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled={!input || isSubmitting} />
          </PromptInputFooter>
        </PromptInput>
      </DialogContent>
    </Dialog>
  );
}
