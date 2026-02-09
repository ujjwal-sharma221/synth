"use client";

import { formatDistanceToNow } from "date-fns";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetConversations } from "../hooks/use-conversation";

interface PastConversationsDialogProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (conversationId: Id<"conversations">) => void;
}

export function PastConversationsDialog({
  projectId,
  open,
  onOpenChange,
  onSelect,
}: PastConversationsDialogProps) {
  const conversations = useGetConversations(projectId);

  const handleSelect = (conversationId: Id<"conversations">) => {
    onSelect(conversationId);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      onOpenChange={onOpenChange}
      open={open}
      title="Past Conversations"
      description="Search and select past conversations"
    >
      <CommandInput placeholder="Search conversations..." />
      <CommandList>
        <CommandEmpty>No convesations found</CommandEmpty>
        <CommandGroup heading="Conversations">
          {conversations?.map((conversation) => (
            <CommandItem
              key={conversation._id}
              value={`${conversation.title}-${conversation._id}`}
              onSelect={() => handleSelect(conversation._id)}
            >
              <div className="flex flex-col gap-0.5">
                {conversation.title}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(conversation._creationTime, {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
