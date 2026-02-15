"use client";

import { z } from "zod/v4";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";

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
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";

export function SignInForm({
  className,
}: {
  className?: string;
  inAuthScreen?: boolean;
}) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingGitHub, setIsSubmittingGitHub] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (values) => {
      setIsSubmittingEmail(true);
      const toastId = toast.loading("Signing in...");
      await authClient.signIn.email(
        {
          email: values.value.email,
          password: values.value.password,
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

      setIsSubmittingEmail(false);
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
        errorCallbackURL: "/sign-in",
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
        "mx-auto w-full max-w-md rounded-2xl border border-border/50 bg-linear-to-b from-muted/40 via-background to-background p-2",
        className,
      )}
    >
      <Card className="border-border/60 bg-card/95 shadow-xl shadow-black/5">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            Sign in
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Continue to your account
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
            disabled={isSubmittingEmail || isSubmittingGitHub}
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
                        disabled={isSubmittingEmail || isSubmittingGitHub}
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
                        autoComplete="current-password"
                        type="password"
                        disabled={isSubmittingEmail || isSubmittingGitHub}
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
              disabled={isSubmittingEmail || isSubmittingGitHub}
            >
              {isSubmittingEmail ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <CardDescription className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium underline underline-offset-4"
            >
              Sign Up
            </Link>
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
});
