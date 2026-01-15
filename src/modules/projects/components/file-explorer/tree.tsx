import { useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

import {
  useCreateFile,
  useCreateFolder,
  useDeleteFile,
  useFolderContents,
  useRenameFile,
} from "../../hooks/use-files";
import { cn } from "@/lib/utils";
import { getItemPadding } from "../utils";
import { LoadingRow } from "./loading-row";
import { CreateInput } from "./create-input";
import { RenameInput } from "./rename-input";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

interface TreeProps {
  level: number;
  item: Doc<"files">;
  projectId: Id<"projects">;
}

export function Tree({ level = 0, item, projectId }: TreeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    enabled: item.type === "folder" && isOpen,
  });

  const startCreating = (type: "file" | "folder") => {
    setCreating(type);
    setIsOpen(true);
  };

  const handleRename = (newName: string) => {
    setIsRenaming(false);
    if (newName === item.name) return;

    renameFile({
      id: item._id,
      name: newName,
    });
  };

  const fileName = item.name;

  if (item.type === "file") {
    if (isRenaming) {
      return (
        <RenameInput
          type="file"
          defaultValue={fileName}
          isOpen={isOpen}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      );
    }

    return (
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={false}
        onClick={() => {}}
        onDoubleClick={() => {}}
        onRename={() => setIsRenaming(true)}
        onDelete={() => {
          deleteFile({ id: item._id });
        }}
      >
        <FileIcon fileName={fileName} autoAssign className="size-4" />
        <p className="text-sm line-clamp-1">{fileName}</p>
      </TreeItemWrapper>
    );
  }

  const folderName = item.name;
  const folderRender = (
    <>
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            isOpen && "rotate-90"
          )}
        />
        <FolderIcon folderName={folderName} className="size-4" />
      </div>
      <span className="text-sm line-clamp-1">{folderName}</span>
    </>
  );

  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        name,
        parentId: item._id,
        projectId,
        content: "",
      });
    } else {
      createFolder({
        name,
        parentId: item._id,
        projectId,
      });
    }
  };

  if (creating) {
    return (
      <>
        <button
          onClick={() => setIsOpen(!open)}
          className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
          style={{ paddingLeft: getItemPadding({ level, isFile: false }) }}
        >
          {folderRender}
        </button>

        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow level={level + 1} />}
            <CreateInput
              type={creating}
              level={level + 1}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />

            {folderContents?.map((subItem) => (
              <Tree
                key={subItem._id}
                item={subItem}
                level={level + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }

  if (isRenaming) {
    return (
      <>
        <RenameInput
          type="folder"
          defaultValue={folderName}
          isOpen={isOpen}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />

        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow level={level + 1} />}

            {folderContents?.map((subItem) => (
              <Tree
                key={subItem._id}
                item={subItem}
                level={level + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }

  return (
    <>
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={false}
        onClick={() => setIsOpen(!isOpen)}
        onRename={() => setIsRenaming(true)}
        onDelete={() => {
          deleteFile({ id: item._id });
        }}
        onCreateFile={() => startCreating("file")}
        onCreateFolder={() => startCreating("folder")}
      >
        {folderRender}
      </TreeItemWrapper>

      {isOpen && (
        <>
          {folderContents === undefined && <LoadingRow level={level + 1} />}
          {folderContents?.map((subItem) => (
            <Tree
              key={subItem._id}
              item={subItem}
              level={level + 1}
              projectId={projectId}
            />
          ))}
        </>
      )}
    </>
  );
}
