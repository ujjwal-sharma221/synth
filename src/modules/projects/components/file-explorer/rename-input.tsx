import { useState } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

import { cn } from "@/lib/utils";
import { getItemPadding } from "../utils";

interface RenameInputProps {
  type: "file" | "folder";
  level: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  defaultValue: string;
  isOpen?: boolean;
}

export function RenameInput({
  type,
  level,
  onSubmit,
  onCancel,
  defaultValue,
  isOpen,
}: RenameInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = () => {
    const trimmedValue = value.trim() || defaultValue;
    onSubmit(trimmedValue);
  };

  return (
    <div
      className="w-full flex items-center gap-1 h-5.5"
      style={{
        paddingLeft: getItemPadding({ level, isFile: type === "file" }),
      }}
    >
      <div className="flex items-center gap-0.5">
        {type === "folder" && (
          <CaretRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              isOpen && "rotate-90"
            )}
          />
        )}
        {type === "file" && (
          <FileIcon fileName={value} autoAssign className="size-4" />
        )}
        {type === "folder" && (
          <FolderIcon folderName={value} className="size-4" />
        )}
      </div>

      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        onFocus={(e) => {
          if (type === "folder") {
            e.currentTarget.select();
          } else {
            const value = e.currentTarget.value;
            const lastDotIndex = value.lastIndexOf(".");
            if (lastDotIndex > 0) {
              e.currentTarget.setSelectionRange(0, lastDotIndex);
            } else {
              e.currentTarget.select();
            }
          }
        }}
      />
    </div>
  );
}
