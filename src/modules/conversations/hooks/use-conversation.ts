import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useGetConversation = (id: Id<"conversations"> | null) => {
  return useQuery(
    api.conversations.getById,
    id ? { conversationId: id } : "skip",
  );
};

export const useGetMessages = (id: Id<"conversations"> | null) => {
  return useQuery(
    api.conversations.getMessages,
    id ? { conversationId: id } : "skip",
  );
};

export const useGetConversations = (id: Id<"projects"> | null) => {
  return useQuery(
    api.conversations.getByProjectId,
    id ? { projectId: id } : "skip",
  );
};

export const useCreateConversation = () => {
  return useMutation(api.conversations.create);
};
