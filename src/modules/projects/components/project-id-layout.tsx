"use client";

import { Allotment } from "allotment";
import { PropsWithChildren } from "react";

import {
  DEFAULT_MAIN_SIZE,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  DEFAULT_CONVERSATION_SIDEBAR_WIDTH,
} from "@/lib/constants";
import { Navbar } from "./ui/navbar";
import { Id } from "../../../../convex/_generated/dataModel";
import { ConversationSidebar } from "@/modules/conversations/components/conversation-sidebar";

import "allotment/dist/style.css";

type LayoutProps = PropsWithChildren<{
  projectId: Id<"projects">;
}>;

export function ProjectIdLayout({ projectId, children }: LayoutProps) {
  return (
    <div className="bg-background text-foreground w-full h-screen flex flex-col">
      <Navbar projectId={projectId} />
      <div className="flex-1 flex overflow-hidden">
        <Allotment
          className="flex-1"
          defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
        >
          <Allotment.Pane
            snap
            minSize={MIN_SIDEBAR_WIDTH}
            maxSize={MAX_SIDEBAR_WIDTH}
            preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
          >
            <ConversationSidebar projectId={projectId} />
          </Allotment.Pane>
          <Allotment.Pane>{children}</Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}
