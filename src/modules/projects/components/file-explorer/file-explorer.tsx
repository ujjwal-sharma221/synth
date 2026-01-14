import {
  ChevronRightIcon,
  CopyMinusIcon,
  FilePlusCornerIcon,
  FolderPlusIcon,
} from "lucide-react";
import { useState } from "react";

import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
} from "../../hooks/use-files";
import { Tree } from "./tree";
import { cn } from "@/lib/utils";
import { LoadingRow } from "./loading-row";
import { CreateInput } from "./create-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetProjectById } from "../../hooks/use-project";
import { Id } from "../../../../../convex/_generated/dataModel";

export function FileExplorer({ projectId }: { projectId: Id<"projects"> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const project = useGetProjectById(projectId);
  const rootFiles = useFolderContents({ projectId, enabled: isOpen });

  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: undefined,
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: undefined,
      });
    }
  };

  return (
    <div className="h-full bg-sidebar border-r border-border">
      <ScrollArea>
        <div
          className="group/project w-full bg-sidebar-accent/50 cursor-pointer text-left font-bold h-7 gap-0.5 flex items-center px-2 hover:bg-sidebar-accent transition-colors"
          role="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronRightIcon
            className={cn("size-4 shrink-0 ", isOpen && "rotate-90")}
          />
          <p className="text-xs uppercase line-clamp-1">
            {project?.name ?? "Loading..."}
          </p>

          <div className="opacity-0 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(true);
                setCreating("file");
              }}
              size="icon-xs"
              variant="highlight"
            >
              <FilePlusCornerIcon className="size-3.5" />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(true);
                setCreating("folder");
              }}
              size="icon-xs"
              variant="highlight"
            >
              <FolderPlusIcon className="size-3.5" />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCollapseKey((prev) => prev + 1);
              }}
              size="icon-xs"
              variant="highlight"
            >
              <CopyMinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {isOpen && (
          <>
            {rootFiles === undefined && <LoadingRow level={0} />}
            {creating && (
              <CreateInput
                type={creating}
                level={0}
                onSubmit={handleCreate}
                onCancel={() => setCreating(null)}
              />
            )}
            {rootFiles?.map((item) => (
              <Tree
                key={`${item._id}-${collapseKey}`}
                level={0}
                item={item}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
