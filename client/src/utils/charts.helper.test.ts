import { describe, expect, it } from "vitest";
import type { JobApplication } from "@app-types/application";
import { ChartHelper, chartColor } from "./charts.helper.ts";

describe("chartColor", () => {
  it("returns distinct theme colors for the first several slices", () => {
    const colors = Array.from({ length: 8 }, (_, index) => chartColor(index));
    expect(new Set(colors).size).toBe(8);
  });

  it("still returns a color when there are more slices than the base palette", () => {
    expect(chartColor(20)).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("numberOfApplicationsByDay", () => {
  const now = new Date(2026, 7, 29, 18, 0, 0);

  it("returns one row per day including zeros", () => {
    const helper = new ChartHelper([
      applicationOn("2026-08-29"),
      applicationOn("2026-08-29"),
      applicationOn("2026-08-27"),
      applicationOn("2026-08-20"),
    ]);

    const rows = helper.numberOfApplicationsByDay(7, now);

    expect(rows).toHaveLength(7);
    expect(rows[0]?.date).toBe("2026-08-23");
    expect(rows.at(-1)?.date).toBe("2026-08-29");
    expect(rows.find((row) => row.date === "2026-08-29")?.count).toBe(2);
    expect(rows.find((row) => row.date === "2026-08-27")?.count).toBe(1);
    expect(rows.find((row) => row.date === "2026-08-23")?.count).toBe(0);
    expect(rows.find((row) => row.date === "2026-08-20")).toBeUndefined();
  });
});

describe("numberOfApplicationsByStatus", () => {
  it("groups counts with pipeline labels and omits empty stages", () => {
    const helper = new ChartHelper([
      applicationOn("2026-08-29", "applied"),
      applicationOn("2026-08-28", "applied"),
      applicationOn("2026-08-27", "rejected"),
    ]);

    expect(helper.numberOfApplicationsByStatus()).toEqual([
      {
        status: "applied",
        statusLabel: "Applied",
        count: 2,
        fill: "#4f46e5",
      },
      {
        status: "rejected",
        statusLabel: "Rejected",
        count: 1,
        fill: "#e11d48",
      },
    ]);
  });
});

function applicationOn(
  appliedAt: string,
  status: JobApplication["status"] = "applied",
): JobApplication {
  return {
    id: appliedAt,
    user_id: "user-1",
    company: "Acme",
    role: "Engineer",
    salary: null,
    status,
    source: null,
    location: {
      name: "Remote",
      country: "",
      countryCode: "",
      lat: 0,
      lng: 0,
    },
    job_url: "",
    job_description: null,
    job_type: "remote",
    notes: null,
    applied_at: appliedAt,
    created_at: appliedAt,
    updated_at: appliedAt,
  };
}
