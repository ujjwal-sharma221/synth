"use client";

import { useState } from "react";
import { Allotment } from "allotment";
import { ShareIcon } from "lucide-react";

import {
  DEFAULT_MAIN_SIZE,
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Id } from "../../../../convex/_generated/dataModel";

import "allotment/dist/style.css";
import { FileExplorer } from "./file-explorer/file-explorer";

export function ProjectIdView({ projectId }: { projectId: Id<"projects"> }) {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-full flex flex-col">
      <nav className="h-8.75 items-center flex border-b border-border bg-sidebar text-sidebar-foreground">
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
          <div className="flex items-center px-3 cursor-pointer h-full gap-1.5 border-l border-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground transition-colors group">
            <ShareIcon className="size-3.5 group-hover:text-sidebar-accent-foreground" />
            <span className="text-xs font-medium">Export to Github</span>
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
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_SIDEBAR_WIDTH}
            >
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>
              <p>Editor View</p>
            </Allotment.Pane>
          </Allotment>
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
        "flex items-center px-4 cursor-pointer h-full gap-2 border-r border-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors bg-sidebar text-muted-foreground font-medium",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      <span className="text-xs">{label}</span>
    </div>
  );
};
