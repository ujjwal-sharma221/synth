import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useCreateFile = () => {
  return useMutation(api.files.createFile);
};

export const useCreateFolder = () => {
  return useMutation(api.files.createFolder);
};

interface FolderContentProps {
  enabled?: boolean;
  parentId?: Id<"files">;
  projectId: Id<"projects">;
}

export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: FolderContentProps) => {
  return useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip",
  );
};

export const useRenameFile = () => {
  return useMutation(api.files.renameFile);
};

export const useDeleteFile = () => {
  return useMutation(api.files.deleteFile);
};

export const useGetFile = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFile, fileId ? { id: fileId } : "skip");
};

export const useGetFilePath = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFilePath, fileId ? { id: fileId } : "skip");
};

export const useUpdateFile = () => {
  return useMutation(api.files.updateFile);
};
