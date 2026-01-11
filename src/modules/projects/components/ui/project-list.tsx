import { CommandIcon } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { Loader } from "@/components/loader";
import { ProjectItem } from "./project-item";
import { ContinueCard } from "./continue-card";
import { useGetProjectsPartial } from "../../hooks/use-project";

interface Props {
  onViewAll: () => void;
}

export function ProjectList({ onViewAll }: Props) {
  const projects = useGetProjectsPartial(6);

  if (projects === undefined) return <Loader />;

  const [mostRecent, ...rest] = projects;

  return (
    <div className="flex flex-col gap-4">
      {mostRecent && <ContinueCard data={mostRecent} />}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Recent Projects
            </span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-2 text-muted-foreground text-xs hover:text-black transition-colors"
            >
              View All
              <Kbd>
                <CommandIcon /> k
              </Kbd>
            </button>
          </div>

          <ul className="flex flex-col">
            {rest.map((project) => (
              <ProjectItem key={project._id} data={project} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
