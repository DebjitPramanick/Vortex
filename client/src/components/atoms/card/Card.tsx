import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../cx.ts";
import "./card.css";

export type CardSize = "sm" | "md" | "lg";
export type CardVariant = "default" | "muted";

export type CardProps = {
  size?: CardSize;
  variant?: CardVariant;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

export function Card({
  size = "md",
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cx(
        "vx-card",
        `vx-card-${size}`,
        variant === "muted" && "vx-card-muted",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export type CardHeaderProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cx("vx-card-header", className)} {...props}>
      {children}
    </div>
  );
}

export type CardTitleProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h2 className={cx("vx-card-title", className)} {...props}>
      {children}
    </h2>
  );
}

export type CardDescriptionProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cx("vx-card-description", className)} {...props}>
      {children}
    </p>
  );
}

export type CardBodyProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cx("vx-card-body", className)} {...props}>
      {children}
    </div>
  );
}

export type CardFooterProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cx("vx-card-footer", className)} {...props}>
      {children}
    </div>
  );
}
