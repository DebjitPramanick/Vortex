import { describe, expect, it } from "vitest";
import { chartColor } from "./charts.helper.ts";

describe("chartColor", () => {
  it("returns distinct theme colors for the first several slices", () => {
    const colors = Array.from({ length: 8 }, (_, index) => chartColor(index));
    expect(new Set(colors).size).toBe(8);
  });

  it("still returns a color when there are more slices than the base palette", () => {
    expect(chartColor(20)).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
