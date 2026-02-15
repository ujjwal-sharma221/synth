"use client";

import { z } from "zod/v4";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { cn } from "@/lib/utils";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SignUpForm({
  className,
  inAuthScreen,
}: {
  className?: string;
  inAuthScreen?: boolean;
}) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingGitHub, setIsSubmittingGitHub] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      const toastId = toast.loading("Signing up...");
      await authClient.signUp.email(
        {
          email: values.value.email,
          password: values.value.password,
          name: values.value.username,
        },
        {
          onError: (error) => {
            setErrorMessage(error.error.message);
          },
          onSuccess: () => {
            setErrorMessage(undefined);
            window.location.href = "/";
          },
        },
      );

      setIsLoading(false);
      toast.dismiss(toastId);
    },
  });

  async function handleLoginWithGitHub() {
    setIsSubmittingGitHub(true);
    const toastId = toast.loading("Redirecting to GitHub...");

    await authClient.signIn.social(
      {
        provider: "github",
        scopes: ["read:user", "user:email", "repo"],
        callbackURL: "/projects",
        errorCallbackURL: "/sign-up",
      },
      {
        onError: (error) => {
          toast.error(error.error.message);
          setIsSubmittingGitHub(false);
          toast.dismiss(toastId);
        },
      },
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md rounded-2xl border border-border/50 bg-gradient-to-b from-muted/40 via-background to-background p-2",
        className,
      )}
    >
      <Card className="border-border/60 bg-card/95 shadow-xl shadow-black/5">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            Create account
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Get started in a few seconds
          </CardDescription>
          <CardDescription className="min-h-5 text-center text-sm text-destructive">
            {errorMessage ?? ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            onClick={handleLoginWithGitHub}
            type="button"
            variant="outline"
            className="h-10 w-full justify-center gap-2 border-border/70 bg-background font-medium"
            disabled={isLoading || isSubmittingGitHub}
          >
            {isSubmittingGitHub
              ? "Connecting to GitHub..."
              : "Continue with GitHub"}
          </Button>

          <div className="relative">
            <Separator />
            <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[11px] uppercase tracking-[0.18em]">
              Or
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="you@company.com"
                        autoComplete="email"
                        disabled={isLoading || isSubmittingGitHub}
                        className="h-10 border-border/70 bg-background"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="********"
                        autoComplete="new-password"
                        type="password"
                        disabled={isLoading || isSubmittingGitHub}
                        className="h-10 border-border/70 bg-background"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="username">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="username"
                        autoComplete="username"
                        disabled={isLoading || isSubmittingGitHub}
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

            <Button
              type="submit"
              className="h-10 w-full font-medium"
              disabled={isLoading || isSubmittingGitHub}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <CardDescription className="text-center text-sm">
            Already have an account?{" "}
            {!inAuthScreen && (
              <Link
                href="/sign-in"
                className="font-medium underline underline-offset-4"
              >
                Sign In
              </Link>
            )}
          </CardDescription>
        </CardContent>
      </Card>
      <FieldDescription className="px-4 py-2 text-center text-xs">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

const formSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" }),
  username: z
    .string()
    .min(3, { error: "Username must be at least 3 characters long" }),
});
