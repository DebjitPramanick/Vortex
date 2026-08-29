import type { HTMLAttributes } from "react";
import { cx } from "../../cx.ts";
import UserIcon from "@icons/user.svg";
import "./avatar.css";

export type AvatarSize = "sm" | "md";

export type AvatarProps = {
  size?: AvatarSize;
  src?: string;
  alt?: string;
} & HTMLAttributes<HTMLSpanElement>;

export function Avatar({
  size = "md",
  src,
  alt,
  className,
  ...props
}: AvatarProps) {
  const label = alt?.trim() || "User";

  return (
    <span
      className={cx("vx-avatar", `vx-avatar-${size}`, className)}
      role="img"
      aria-label={label}
      {...props}
    >
      {src ? (
        <img className="vx-avatar-image" src={src} alt="" />
      ) : (
        <UserIcon className="vx-avatar-icon" aria-hidden="true" />
      )}
    </span>
  );
}
