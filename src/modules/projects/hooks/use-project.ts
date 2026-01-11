import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useGetProjects = () => {
  return useQuery(api.projects.get);
};

export const useGetProjectsPartial = (limit: number) => {
  return useQuery(api.projects.getPartial, { limit });
};

export const useCreateProject = () => {
  return useMutation(api.projects.create);
};

export const useGetProjectById = (id: Id<"projects">) => {
  return useQuery(api.projects.getById, { id });
};

export const useRenameProject = (projectId: Id<"projects">) => {
  return useMutation(api.projects.updateProjectName).withOptimisticUpdate(
    (localStore, args) => {
      const existingProject = localStore.getQuery(api.projects.getById, {
        id: projectId,
      });

      if (existingProject !== undefined && existingProject) {
        localStore.setQuery(
          api.projects.getById,
          {
            id: projectId,
          },
          {
            ...existingProject,
            name: args.name,
            updatedAt: Date.now(),
          }
        );
      }

      const existingProjects = localStore.getQuery(api.projects.get);
      if (existingProject !== undefined) {
        localStore.setQuery(
          api.projects.get,
          {},
          existingProjects?.map((project) => {
            return project._id === args.id
              ? { ...project, name: args.name, updatedAt: Date.now() }
              : project;
          })
        );
      }
    }
  );
};
