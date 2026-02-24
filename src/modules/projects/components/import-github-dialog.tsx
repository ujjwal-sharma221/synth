import { z } from "zod/v4";
import ky, { HTTPError } from "ky";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  url: z.string("Please enter a valid url"),
});

interface ImportGithubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportGithubDialog({
  open,
  onOpenChange,
}: ImportGithubDialogProps) {
  const router = useRouter();

  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      url: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const { projectId } = await ky
          .post("/api/github/import", {
            json: { url: value.url },
          })
          .json<{ projectId: Id<"projects">; success: boolean }>();

        toast.success("importing repo");
        onOpenChange(false);
        form.reset();

        router.push(`projects/${projectId}`);
      } catch (e) {
        if (e instanceof HTTPError) {
          const body = await e.response.json<{ error: string }>();
          if (body.error.includes("Github token is required")) {
            toast.error("Github account not connected");
          }

          onOpenChange(false);
          return;
        }

        toast.error("Unable to import repo, please check the url");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from github</DialogTitle>
          <DialogDescription>
            Enter the github url to import repo. A new project will be created
            by the contents of the same repo
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="url">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Repository URL</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="github url"
                      autoComplete="url"
                      type="url"
                      disabled={false}
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

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Importing" : "Import"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
