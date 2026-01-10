import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGetProjects } from "../../hooks/use-project";
import { getProjectIcon } from "./project-item";

interface ProjectCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCommandDialog({
  onOpenChange,
  open,
}: ProjectCommandDialogProps) {
  const router = useRouter();
  const projects = useGetProjects();

  const handleSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      className="border-none"
      onOpenChange={onOpenChange}
      open={open}
      title="Search projects"
      description="Search and navigate to your projects"
    >
      <CommandInput
        className=""
        placeholder="Search projects..."
      ></CommandInput>
      <CommandList>
        <CommandEmpty>No Projects Found</CommandEmpty>
        <CommandGroup heading="projects">
          {projects?.map((project) => (
            <CommandItem
              key={project._id}
              value={`${project.name}-${project._id}`}
              onSelect={() => handleSelect(project._id)}
            >
              {getProjectIcon(project)}
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
