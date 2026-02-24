import {
  CheckCheck,
  CheckCircle2,
  ExternalLink,
  Loader,
  XCircle,
} from "lucide-react";
import { z } from "zod/v4";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import ky, { HTTPError } from "ky";
import { useForm } from "@tanstack/react-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGetProjectById } from "../hooks/use-project";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExportIcon } from "@phosphor-icons/react";

const formSchema = z.object({
  repoName: z
    .string()
    .min(1, "repo name is required")
    .max(100, "repo name too large"),
  visibility: z.enum(["private", "public"]),
  description: z.string().max(200, { error: "description too long" }),
});

interface ExportGithubPopoverProps {
  projectId: Id<"projects">;
}

export function ExportGithubPopover({ projectId }: ExportGithubPopoverProps) {
  const project = useGetProjectById(projectId);
  const [open, setOpen] = useState(false);

  const exportStatus = project?.exportStatus;
  const exportRepoUrl = project?.exportRepoUrl;

  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      repoName: project?.name ?? "",
      visibility: "private" as "public" | "private",
      description: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await ky.post("/api/github/export", {
          json: {
            projectId,
            repoName: value.repoName,
            visibility: value.visibility,
            description: value.description || undefined,
          },
        });

        toast.success("Exporting project");
      } catch (e) {
        if (e instanceof HTTPError) {
          const body = await e.response.json<{ error: string }>();
          if (body.error.includes("Github token is required")) {
            toast.error("Github account not connected");
          }

          setOpen(false);
          return;
        }

        toast.error("Unable to export repo, please try again");
      }
    },
  });

  const handleCancelExport = async () => {
    await ky.post("/api/github/cancel", {
      json: { projectId },
    });
  };

  const handleResetExport = async () => {
    await ky.post("/api/github/reset", {
      json: { projectId },
    });

    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        repoName: project?.name ?? "",
        visibility: "private",
        description: "",
      });
    }

    setOpen(isOpen);
  };

  const renderContent = () => {
    if (exportStatus === "exporting") {
      return (
        <div className="flex flex-col items-center gap-3">
          <Loader className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm">Exporting to Github</p>

          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={handleCancelExport}
          >
            Cancel
          </Button>
        </div>
      );
    }

    if (exportStatus === "exported" && exportRepoUrl) {
      return (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="size-6 text-muted-foreground" />
          <p className="text-sm">Repo Created</p>
          <p className="text-xs">Your project has been exported to github</p>

          <div className="flex flex-col w-full gap-2">
            <Button size="sm" variant="link" asChild className="w-full">
              <Link
                href={exportRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4 mr-1" />
                View on Github
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleResetExport}
            >
              Close
            </Button>
          </div>
        </div>
      );
    }

    if (exportStatus === "failed") {
      return (
        <div className="flex flex-col items-center gap-3">
          <XCircle className="size-6 animate-pulse text-muted-foreground" />
          <p className="text-sm">Export Failed!</p>
          <p className="text-xs text-muted-foreground">Something went wrong</p>

          <Button size="sm" className="w-full" onClick={handleResetExport}>
            Retry
          </Button>
        </div>
      );
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Export to Github</h4>
            <p className="text-xs text-muted-foreground">
              Export your project to github
            </p>
          </div>

          <FieldGroup>
            <form.Field name="repoName">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Repository Name
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="name"
                      className="h-10 border-border/70 bg-background"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="visibility">
              {(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Visibility</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value: "private" | "public") =>
                        field.handleChange(value)
                      }
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select Visibility" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      rows={2}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="description"
                      className="h-10 border-border/70 bg-background"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Creating" : "Create"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    );
  };

  const getStatusIcon = () => {
    if (exportStatus === "exporting") {
      return <Loader className="animate-spin size-3.5" />;
    }

    if (exportStatus === "exported") {
      return <CheckCheck className="size-3.5" />;
    }

    if (exportStatus === "failed") {
      return <XCircle className="size-3.5" />;
    }

    return <ExportIcon className="size-3.5" />;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-1.5 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
          {getStatusIcon()}
          <span className="text-sm">Export</span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 " align="start">
        {renderContent()}
      </PopoverContent>
    </Popover>
  );
}
