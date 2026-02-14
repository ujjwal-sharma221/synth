"use client";

import { useState } from "react";
import { Allotment } from "allotment";
import { TerminalIcon } from "@phosphor-icons/react";
import { AlertCircleIcon, Loader2Icon, RefreshCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetProjectById } from "../hooks/use-project";
import { Id } from "../../../../convex/_generated/dataModel";
import { useWebcontainer } from "@/modules/preview/hooks/use-webcontainer";
import { PreviewTerminal } from "@/modules/preview/components/preview-terminal";
import { PreviewSettingsPopover } from "@/modules/preview/components/preview-settings-popover";

export function PreviewView({ projectId }: { projectId: Id<"projects"> }) {
  const project = useGetProjectById(projectId);
  const [showTerminal, setShowTerminal] = useState(false);

  const { status, previewUrl, error, restart, terminalOutput } =
    useWebcontainer({
      projectId,
      enabled: true,
      settings: project?.settings,
    });

  const isLoading = status === "booting" || status === "installing";

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-8.75 flex items-center border-b bg-sidebar shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-full rounded-none"
          disabled={isLoading}
          title="Restart container"
        >
          <RefreshCcwIcon className="size-3" />
        </Button>

        <div className="flex-1 h-full flex items-center px-3 bg-background border-x text-xs text-muted-foreground truncate">
          {isLoading && (
            <div className="flex items-center gap-2">
              <Loader2Icon className="size-3 animate-spin" />
              <span>
                {status === "booting"
                  ? "Booting container..."
                  : "Installing dependencies..."}
              </span>
            </div>
          )}
          {previewUrl && <span className="truncate">{previewUrl}</span>}
          {!isLoading && !previewUrl && !error && <span>Ready to preview</span>}
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-full rounded-none"
          title="Toggle terminal"
          onClick={() => setShowTerminal((val) => !val)}
        >
          <TerminalIcon className="size-3" />
        </Button>

        <PreviewSettingsPopover
          projectId={projectId}
          initialValues={project?.settings}
          onSave={restart}
        />
      </div>

      <div className="flex-1 min-h-0">
        <Allotment vertical>
          <Allotment.Pane>
            {error && (
              <div className="size-full flex items-center justify-center text-destructive">
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                  <AlertCircleIcon className="size-6" />
                  <p className="text-sm font-medium">{error}</p>
                  <Button onClick={restart} variant="outline">
                    <RefreshCcwIcon className="size-3" />
                    Restart
                  </Button>
                </div>
              </div>
            )}

            {isLoading && !error && (
              <div className="size-full flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                  <Loader2Icon className="size-6 animate-spin" />
                  <p className="text-sm font-medium">Installing..</p>
                </div>
              </div>
            )}

            {previewUrl && !isLoading && !error && (
              <iframe
                src={previewUrl}
                className="size-full border-0"
                title="Preview"
              />
            )}
          </Allotment.Pane>

          {showTerminal && (
            <Allotment.Pane minSize={100} maxSize={500} preferredSize={200}>
              <div className="h-full flex flex-col bg-background border-t">
                <div className="h-7 flex items-center px-3 text-xs gap-1.5 text-muted-foreground border-b border-border/50 shrink-0">
                  <TerminalIcon className="size-3" />
                  <span>Terminal</span>
                </div>

                <PreviewTerminal output={terminalOutput} />
              </div>
            </Allotment.Pane>
          )}
        </Allotment>
      </div>
    </div>
  );
}
