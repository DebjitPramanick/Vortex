import type { JobApplication } from "@app-types/application";
import { formatLocation } from "./location.helper";
import type { ApplicationCountByLocation } from "@app-types/chart.type";

const THEME_CHART_COLORS = [
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

export function chartColor(index: number): string {
  const base = THEME_CHART_COLORS[index % THEME_CHART_COLORS.length];
  const cycle = Math.floor(index / THEME_CHART_COLORS.length);
  if (cycle === 0) return base;
  return shiftHex(base, cycle * 18);
}

function shiftHex(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const num = Number.parseInt(value, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + (amount % 40) - 12));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) - (amount % 28)));
  const b = Math.min(255, Math.max(0, (num & 255) + (amount % 36)));
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export class ChartHelper {
  private applicationsByLocation: Record<string, JobApplication[]>;

  constructor(applications: JobApplication[]) {
    this.applicationsByLocation = this.groupByLocation(applications);
  }

  private groupByLocation(applications: JobApplication[]) {
    return applications.reduce(
      (acc: Record<string, JobApplication[]>, application: JobApplication) => {
        const key = formatLocation(application.location);
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(application);
        return acc;
      },
      {},
    );
  }

  public numberOfApplicationsByLocation(): ApplicationCountByLocation[] {
    return Object.entries(this.applicationsByLocation).reduce(
      (acc: ApplicationCountByLocation[], [key, applications]) => {
        acc.push({ location: key, count: applications.length });
        return acc;
      },
      [],
    );
  }
}
