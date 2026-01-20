import { useEffect, useRef } from "react";

import { Logo } from "@/components/logo";
import { CodeEditor } from "./ui/code-editor";
import { useEditor } from "../hooks/use-editor";
import { DEBOUNCE_TIME_MS } from "@/lib/constants";
import { TopNavigation } from "./ui/top-navigation";
import { FileBreadCrumbs } from "./ui/file-breadcrumbs";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetFile, useUpdateFile } from "@/modules/projects/hooks/use-files";

export function EditorView({ projectId }: { projectId: Id<"projects"> }) {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useGetFile(activeTabId);
  const updateFile = useUpdateFile();
  const timeOutRef = useRef<NodeJS.Timeout | null>(null);

  const isActiveBinary = activeFile && activeFile.storageId;
  const isActiveTextFile = activeFile && !activeFile.storageId;

  useEffect(() => {
    return () => {
      if (timeOutRef.current) {
        clearTimeout(timeOutRef.current);
      }
    };
  }, [activeTabId]);

  return (
    <div className="h-full flex flex-col">
      <div className="w-full relative z-10">
        <TopNavigation projectId={projectId} />
      </div>

      {activeTabId && <FileBreadCrumbs projectId={projectId} />}
      <div className="flex-1 min-h-0 bg-background">
        {!activeFile && (
          <div className="size-full flex items-center justify-center">
            <Logo height={50} width={50} className="opacity-75" />
          </div>
        )}

        {isActiveTextFile && (
          <CodeEditor
            key={activeFile._id}
            fileName={activeFile.name}
            initalValues={activeFile.content}
            onChange={(content: string) => {
              if (timeOutRef.current) {
                clearTimeout(timeOutRef.current);
              }

              timeOutRef.current = setTimeout(() => {
                updateFile({ id: activeFile._id, content });
              }, DEBOUNCE_TIME_MS);
            }}
          />
        )}
      </div>
    </div>
  );
}
