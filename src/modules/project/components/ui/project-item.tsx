import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertCircleIcon, FolderKanbanIcon, LoaderIcon } from "lucide-react";

import { Doc } from "../../../../../convex/_generated/dataModel";
import Image from "next/image";

export function ProjectItem({ data }: { data: Doc<"projects"> }) {
  return (
    <Link
      href={`/projects/${data._id}`}
      className="text-sm font-medium hover:text-foreground/60 py-1 flex items-center justify-between w-full group"
    >
      <div className="flex items-center gap-2">
        {getProjectIcon(data)}
        <span className="truncate">{data.name}</span>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
        {formatTimeStamp(data.updatedAt)}
      </span>
    </Link>
  );
}

const formatTimeStamp = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const getProjectIcon = (project: Doc<"projects">) => {
  if (project.importStatus === "imported") {
    return (
      <Image
        src="/github-dark.svg"
        height={15}
        width={15}
        alt="github-icon"
        className="text-muted-foreground"
      />
    );
  }

  if (project.importStatus === "failed") {
    return <AlertCircleIcon className="size-3.5 " />;
  }

  if (project.importStatus === "importing") {
    return <LoaderIcon className="size-3.5 animate-spin" />;
  }

  return <FolderKanbanIcon className="size-3.5 " />;
};
