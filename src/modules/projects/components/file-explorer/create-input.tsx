import { useState } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

import { getItemPadding } from "../utils";

interface CreateInputProps {
  type: "file" | "folder";
  level: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function CreateInput({
  type,
  level,
  onSubmit,
  onCancel,
}: CreateInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onSubmit(trimmedValue);
    } else {
      onCancel();
    }
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
          <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
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
      />
    </div>
  );
}
