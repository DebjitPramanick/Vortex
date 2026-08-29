import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../cx.ts";
import "./button.css";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = {
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  size = "md",
  variant = "primary",
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx("vx-btn", `vx-btn-${size}`, `vx-btn-${variant}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
