import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cx } from "../../cx.ts";
import "./chip.css";

export type ChipSize = "sm" | "md" | "lg";
export type ChipVariant =
  | "neutral"
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type ChipProps = {
  size?: ChipSize;
  variant?: ChipVariant;
  onRemove?: () => void;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

export function Chip({
  size = "md",
  variant = "neutral",
  onRemove,
  className,
  children,
  ...props
}: ChipProps) {
  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      className={cx("vx-chip", `vx-chip-${size}`, `vx-chip-${variant}`, className)}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          className="vx-chip-remove"
          aria-label="Remove"
          onClick={handleRemove}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
