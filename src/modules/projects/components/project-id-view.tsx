"use client";

import { useState } from "react";
import { ShareIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Id } from "../../../../convex/_generated/dataModel";

export function ProjectIdView({ projectId }: { projectId: Id<"projects"> }) {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-full flex-flex-col">
      <nav className="h-8.75 items-center flex border-b bg-black">
        <Tab
          label="Code"
          isActive={activeTab === "editor"}
          onClick={() => setActiveTab("editor")}
        />
        <Tab
          label="Preview"
          isActive={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
        />

        <div className="flex-1 flex justify-end h-full">
          <div className="flex items-center px-3 cursor-pointer h-full gap-1.5 border-l hover:bg-[#1F1F1F]">
            <ShareIcon className="size-3.5" />
            <span>Export to Github</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 relative">
        <div
          className={cn(
            "absolute inset-0",
            activeTab === "editor" ? "visible" : "invisible"
          )}
        >
          <div>Editor</div>
        </div>

        <div
          className={cn(
            "absolute inset-0",
            activeTab === "preview" ? "visible" : "invisible"
          )}
        >
          <div>Preview</div>
        </div>
      </div>
    </div>
  );
}

const Tab = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  onClick: () => void;
  isActive: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center px-3 cursor-pointer h-full gap-2 border-r hover:bg-[#1F1F1F]",
        isActive && "bg-[#313647]"
      )}
    >
      <span className="text-sm">{label}</span>
    </div>
  );
};
