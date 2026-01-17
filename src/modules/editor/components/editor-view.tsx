import { Logo } from "@/components/logo";
import { CodeEditor } from "./ui/code-editor";
import { useEditor } from "../hooks/use-editor";
import { TopNavigation } from "./ui/top-navigation";
import { FileBreadCrumbs } from "./ui/file-breadcrumbs";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetFile } from "@/modules/projects/hooks/use-files";

export function EditorView({ projectId }: { projectId: Id<"projects"> }) {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useGetFile(activeTabId);

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

        {activeFile && <CodeEditor />}
      </div>
    </div>
  );
}
