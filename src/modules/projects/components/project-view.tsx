"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { CommandIcon, LogOutIcon, SparkleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { ProjectList } from "./ui/project-list";
import { NewProjectDialog } from "./new-project-dialog";
import { ProjectCommandDialog } from "./ui/command-dialog";
import { ImportGithubDialog } from "./import-github-dialog";

export function ProjectView() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false);
  const [isNewProjectDialog, setIsNewProjectDialogOpen] = useState(false);

  const handleLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/sign-in";
        },
        onError: () => {
          toast.error("Unable to log out. Please try again.");
        },
      },
    });
  };

  useEffect(() => {
    const handleKeyboardEvent = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setIsCommandDialogOpen(true);
        }

        if (e.key === "i") {
          e.preventDefault();
          setIsImportDialogOpen(true);
        }

        if (e.key === "j") {
          e.preventDefault();
          setIsNewProjectDialogOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyboardEvent);
    return () => document.removeEventListener("keydown", handleKeyboardEvent);
  }, []);

  return (
    <>
      <ProjectCommandDialog
        onOpenChange={setIsCommandDialogOpen}
        open={isCommandDialogOpen}
      />

      <ImportGithubDialog
        onOpenChange={setIsImportDialogOpen}
        open={isImportDialogOpen}
      />

      <NewProjectDialog
        onOpenChange={setIsNewProjectDialogOpen}
        open={isNewProjectDialog}
      />

      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <div className="max-w-sm w-full mx-auto flex flex-col gap-4 items-center">
          <div className="flex justify-between gap-4 w-full items-center">
            <div className="flex items-center gap-2 w-full group/logo">
              <Logo isDarkMode height={32} width={32} />
              <h1 className={cn("text-4xl md:text-5xl font-semibold ")}>
                Synth
              </h1>
            </div>
            <Button onClick={handleLogout} size="sm" variant="outline">
              <LogOutIcon className="size-4" />
              Logout
            </Button>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNewProjectDialogOpen(true)}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <SparkleIcon className="size-4" />
                  <Kbd className="bg-accent border">
                    <CommandIcon /> J
                  </Kbd>
                </div>
                <div>
                  <span className="text-sm">New</span>
                </div>
              </Button>

              <Button
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <Image
                    src="/github-dark.svg"
                    height={15}
                    width={15}
                    alt="github-logo"
                  />
                  <Kbd className="bg-accent border">
                    <CommandIcon /> I
                  </Kbd>
                </div>
                <div>
                  <span className="text-sm">Import</span>
                </div>
              </Button>
            </div>

            <ProjectList onViewAll={() => setIsCommandDialogOpen(true)} />
          </div>
        </div>
      </div>
    </>
  );
}
