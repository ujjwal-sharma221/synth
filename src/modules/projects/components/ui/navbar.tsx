import Link from "next/link";
import { useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useGetProjectById, useRenameProject } from "../../hooks/use-project";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CloudCheckIcon, LoaderIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Navbar({ projectId }: { projectId: Id<"projects"> }) {
  const project = useGetProjectById(projectId);
  const renameProject = useRenameProject();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  const handleStartRenaming = () => {
    if (!project) return;
    setNewName(project.name);
    setIsRenaming(true);
  };

  const handleSubmit = () => {
    if (!project) return;

    setIsRenaming(false);
    const sanitizedName = newName.trim();
    if (!sanitizedName || sanitizedName === project.name) return;

    renameProject({ id: projectId, name: sanitizedName }).then(() => {
      setIsRenaming(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") setIsRenaming(false);
  };

  return (
    <nav className="flex justify-between items-center gap-x-2 p-2 bg-background border-b border-border text-foreground">
      <div className="flex items-center gap-x-2 ">
        <Breadcrumb>
          <BreadcrumbList className="gap-0">
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center gap-1.5" asChild>
                <Button
                  variant="ghost"
                  className="w-fit! p-1.5! h-7! hover:bg-accent hover:text-accent-foreground transition-colors "
                  asChild
                >
                  <Link href="/projects" className="space-x-1">
                    <Logo height={15} width={15} isDarkMode />
                    <span className="text-sm font-medium">projects</span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="ml-0! mr-1" />

            <BreadcrumbItem>
              {isRenaming ? (
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  type="text"
                  onFocus={(e) => e.currentTarget.select()}
                  onBlur={handleSubmit}
                  onKeyDown={handleKeyDown}
                  className="text-sm bg-transparent text-foreground outline-none transition-colors focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-40 truncate rounded-sm"
                />
              ) : (
                <BreadcrumbPage
                  onClick={handleStartRenaming}
                  className="text-sm cursor-pointer hover:text-foreground/80 font-medium max-w-40 truncate text-muted-foreground"
                >
                  {project?.name || "loading project name..."}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {project?.importStatus === "importing" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <LoaderIcon className="size-4 text-muted-foreground animate-spin" />
            </TooltipTrigger>
          </Tooltip>
        ) : (
          project?.updatedAt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <CloudCheckIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Saved{" "}
                {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
              </TooltipContent>
            </Tooltip>
          )
        )}
      </div>

      <div className="flex items-center">
        <UserAvatar isDarkMode />
      </div>
    </nav>
  );
}
