"use client";

import { z } from "zod/v4";
import { useState } from "react";
import { useMutation } from "convex/react";
import { Settings2Icon } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

const settingsSchema = z.object({
  devCommand: z.string(),
  installCommand: z.string(),
});

interface PreviewSettingsPopoverProps {
  projectId: Id<"projects">;
  onSave?: () => void;
  initialValues?: Doc<"projects">["settings"];
}

export function PreviewSettingsPopover({
  projectId,
  onSave,
  initialValues,
}: PreviewSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const updateSettings = useMutation(api.projects.updateSettings);

  const form = useForm({
    defaultValues: {
      devCommand: initialValues?.devCommand ?? "",
      installCommand: initialValues?.installCommand ?? "",
    },
    validators: {
      onSubmit: settingsSchema,
    },
    onSubmit: async (values) => {
      await updateSettings({
        id: projectId,
        settings: values.value,
      });
      onSave?.();
      setOpen(false);
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        installCommand: initialValues?.installCommand ?? "",
        devCommand: initialValues?.devCommand ?? "",
      });
    }

    setOpen(isOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-full rounded-none"
          title="Preview Settings"
        >
          <Settings2Icon className="size-3" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm"> Preview Settings</h4>
              <p className="text-xs text-muted-foreground">
                Configure how your project runs in the preview
              </p>
            </div>

            <form.Field name="installCommand">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Install Command
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="npm install"
                      autoComplete="on"
                    />
                    <FieldDescription>
                      The command to install dependencies
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="devCommand">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Dev Command</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="npm run dev"
                      autoComplete="on"
                    />
                    <FieldDescription>
                      The command to start the dev server
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  size="sm"
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Settings"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
