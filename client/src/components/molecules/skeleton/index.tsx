import { cx } from "@components/cx";
import React from "react";
import "./index.css";

type Rounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: Rounded;
  className?: string;
}

const roundedMap: Record<Rounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({
  width = "100%",
  height = 16,
  rounded = "md",
  className = "",
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      style={style}
      className={cx("vx-skeleton", roundedMap[rounded], className)}
    >
      <div className="vx-skeleton-shimmer" />
    </div>
  );
}

export default Skeleton;
