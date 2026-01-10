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

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Register Your Account</CardTitle>
          <CardDescription className="text-destructive">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
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
                        placeholder="mail@mail.com"
                        autoComplete="off"
                        disabled={isLoading}
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
                        autoComplete="off"
                        type="password"
                        disabled={isLoading}
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
                        autoComplete="off"
                        disabled={isLoading}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <Button type="submit" disabled={isLoading}>
              Register{" "}
            </Button>
          </form>

          <CardDescription className="mt-4">
            Already have an account?{" "}
            {!inAuthScreen && (
              <Link href="/sign-in" className="underline">
                Sign In
              </Link>
            )}
          </CardDescription>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking register, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
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
