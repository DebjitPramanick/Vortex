import { formatLocation } from "@utils";
import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import type {
  JobApplication,
  ApplicationCountByLocation,
  ApplicationCountByStatus,
  ApplicationCountByDay,
  ApplicationStatus,
} from "@app-types";
import {
  APPLICATION_STATUSES,
  STATUS_CHART_COLOR,
  STATUS_LABEL,
  THEME_CHART_COLORS,
} from "@constants";

export function chartColor(index: number): string {
  const base = THEME_CHART_COLORS[index % THEME_CHART_COLORS.length];
  const cycle = Math.floor(index / THEME_CHART_COLORS.length);
  if (cycle === 0) return base;
  return shiftHex(base, cycle * 18);
}

function shiftHex(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const num = Number.parseInt(value, 16);
  const r = Math.min(
    255,
    Math.max(0, ((num >> 16) & 255) + (amount % 40) - 12),
  );
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) - (amount % 28)));
  const b = Math.min(255, Math.max(0, (num & 255) + (amount % 36)));
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function appliedDayKey(appliedAt: string): string {
  const dateOnly = appliedAt.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateOnly;
  return format(parseISO(appliedAt), "yyyy-MM-dd");
}

function parseLocalDay(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export class ChartDataProcessor {
  private applications: JobApplication[];

  constructor(applications: JobApplication[]) {
    this.applications = applications;
  }

  public numberOfMostApplicationsByLocation(): ApplicationCountByLocation[] {
    const applicationsByLocation = this.applications.reduce(
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
    return Object.entries(applicationsByLocation).reduce(
      (acc: ApplicationCountByLocation[], [key, applications]) => {
        console.log(key, applications.length);
        if (applications.length >= 4) {
          acc.push({ location: key, count: applications.length });
        }
        return acc;
      },
      [],
    );
  }

  public numberOfApplicationsByStatus(): ApplicationCountByStatus[] {
    const counts = new Map<ApplicationStatus, number>();
    for (const application of this.applications) {
      counts.set(application.status, (counts.get(application.status) ?? 0) + 1);
    }

    return APPLICATION_STATUSES.filter(
      (status) => (counts.get(status) ?? 0) > 0,
    ).map((status) => ({
      status,
      statusLabel: STATUS_LABEL[status],
      count: counts.get(status) ?? 0,
      fill: STATUS_CHART_COLOR[status],
    }));
  }

  public numberOfApplicationsByDay(
    days: number,
    now: Date = new Date(),
  ): ApplicationCountByDay[] {
    const windowSize = Math.max(1, Math.floor(days));
    const end = startOfLocalDay(now);
    const start = subDays(end, windowSize - 1);
    const counts = new Map<string, number>();

    for (const application of this.applications) {
      const key = appliedDayKey(application.applied_at);
      const day = parseLocalDay(key);
      if (day < start || day > end) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return eachDayOfInterval({ start, end }).map((day) => {
      const date = format(day, "yyyy-MM-dd");
      return {
        date,
        label: format(day, "d MMM"),
        count: counts.get(date) ?? 0,
      };
    });
  }
  public numberOfApplicationsByResumeScore(): {
    label: string;
    value: number;
  }[] {
    const counts = {
      ">=90": 0,
      "85-89": 0,
      "<85": 0,
    };
    for (const application of this.applications) {
      if (!application.resume_score) continue;
      if (application.resume_score >= 90) {
        counts[">=90"]++;
      } else if (
        application.resume_score >= 85 &&
        application.resume_score < 90
      ) {
        counts["85-89"]++;
      } else {
        counts["<85"]++;
      }
    }
    return Object.entries(counts).reduce(
      (acc: { label: string; value: number }[], [key, count]) => {
        acc.push({ label: key, value: count });
        return acc;
      },
      [],
    );
  }
}
