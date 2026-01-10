import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

export const useGetProjects = () => {
  return useQuery(api.projects.get);
};

export const useGetProjectsPartial = (limit: number) => {
  return useQuery(api.projects.getPartial, { limit });
};

export const useCreateProject = () => {
  return useMutation(api.projects.create);
};
