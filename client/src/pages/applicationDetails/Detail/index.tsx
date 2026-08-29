import type { ReactNode } from "react";
import "./index.css";

export type DetailProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
};

export function Detail({
  label,
  value,
  mono = false,
  className,
}: DetailProps) {
  return (
    <div className={className}>
      <dt className="vx-detail-label">
        <span className="vx-detail-label-text">{label}</span>
      </dt>
      <dd
        className={`mt-1 text-[13px] ${mono ? "vx-meta text-vortex-fg" : "text-vortex-fg"}`}
      >
        {value}
      </dd>
    </div>
  );
}
