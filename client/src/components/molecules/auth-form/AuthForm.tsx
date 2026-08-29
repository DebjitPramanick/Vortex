import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ReactNode } from "react";
import { Button } from "../../atoms/button";
import "./auth-form.css";

function createAuthSchema(isSignup: boolean) {
  return z
    .object({
      email: z.string().email("Enter a valid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (!isSignup) return;
      if (!values.confirmPassword || values.confirmPassword.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Confirm your password",
        });
        return;
      }
      if (values.password !== values.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    });
}

export type AuthFormMode = "login" | "signup";

export type AuthFormValues = {
  email: string;
  password: string;
};

export type AuthFormProps = {
  mode: AuthFormMode;
  title: string;
  description: string;
  submitLabel: string;
  footer: ReactNode;
  error?: string | null;
  loading?: boolean;
  onSubmit: (values: AuthFormValues) => Promise<void> | void;
};

export function AuthForm({
  mode,
  title,
  description,
  submitLabel,
  footer,
  error,
  loading = false,
  onSubmit,
}: AuthFormProps) {
  const isSignup = mode === "signup";
  const form = useForm({
    resolver: zodResolver(createAuthSchema(isSignup)),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form
      className="vx-auth-form"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({ email: values.email, password: values.password });
      })}
      noValidate
    >
      <div>
        <h1 className="vx-page-title text-[1.5rem]">{title}</h1>
        <p className="mt-1 text-[13px] text-vortex-secondary">{description}</p>
      </div>

      {error ? <p className="vx-auth-banner">{error}</p> : null}

      <label className="vx-auth-field">
        <span className="vx-auth-label">Email</span>
        <input
          className="vx-input"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="vx-auth-error">{form.formState.errors.email.message}</p>
        ) : null}
      </label>

      <label className="vx-auth-field">
        <span className="vx-auth-label">Password</span>
        <input
          className="vx-input"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder="••••••••"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="vx-auth-error">{form.formState.errors.password.message}</p>
        ) : null}
      </label>

      {isSignup ? (
        <label className="vx-auth-field">
          <span className="vx-auth-label">Confirm password</span>
          <input
            className="vx-input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="vx-auth-error">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </label>
      ) : null}

      <Button type="submit" variant="primary" loading={loading}>
        {submitLabel}
      </Button>

      <p className="vx-auth-footer">{footer}</p>
    </form>
  );
}
