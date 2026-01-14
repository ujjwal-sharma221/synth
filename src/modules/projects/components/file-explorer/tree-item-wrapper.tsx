import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { getItemPadding } from "../utils";
import { Doc } from "../../../../../convex/_generated/dataModel";

interface TreeItemWrapperProps {
  item: Doc<"files">;
  level: number;
  isActive?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}

export function TreeItemWrapper({
  item,
  level,
  isActive,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  children,
}: PropsWithChildren<TreeItemWrapperProps>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className="">
        <button
          className={cn(
            "group flex items-center gap-1 w-full h-[22px] hover:bg-sidebar-accent outline-none focus:ring-1 focus:ring-sidebar-ring focus:ring-inset text-sidebar-foreground cursor-pointer"
          )}
          style={{
            paddingLeft: getItemPadding({
              level,
              isFile: item.type === "file",
            }),
          }}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename?.();
            }
          }}
        >
          {children}
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-64 bg-popover text-popover-foreground"
      >
        {item.type === "folder" && (
          <>
            <ContextMenuItem onClick={onCreateFile} className="text-sm">
              New File
            </ContextMenuItem>
            <ContextMenuItem onClick={onCreateFolder} className="text-sm">
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        <ContextMenuItem onClick={onRename} className="text-sm">
          Rename
          <ContextMenuShortcut className="text-muted-foreground">
            Enter
          </ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={onDelete} className="text-sm">
          Delete
          <ContextMenuShortcut className="text-muted-foreground">
            Shift + Delete
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
