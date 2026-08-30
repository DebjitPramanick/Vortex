import type { ApplicationStatus } from "@app-types";

export const STATUS_CHART_COLOR: Record<ApplicationStatus, string> = {
  saved: "#475569",
  applied: "#4f46e5",
  screening: "#0891b2",
  interview: "#7c3aed",
  offer: "#059669",
  rejected: "#e11d48",
  withdrawn: "#d97706",
};

export const THEME_CHART_COLORS = [
  "#4f46e5",
  "#0891b2",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#e11d48",
  "#4338ca",
  "#0e7490",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#fb7185",
];
