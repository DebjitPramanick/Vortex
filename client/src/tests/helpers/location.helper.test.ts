import { describe, expect, it, vi } from "vitest";
import { fetchLocation, searchLocations } from "@utils";

describe("searchLocations", () => {
  it("returns special work-mode options without calling GeoNames", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchLocations("remote")).resolves.toEqual([
      {
        name: "Remote",
        country: "",
        countryCode: "",
        lat: 0,
        lng: 0,
      },
    ]);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("returns an empty list for short queries", async () => {
    await expect(searchLocations("a")).resolves.toEqual([]);
  });
});

describe("fetchLocation", () => {
  it("falls back to a label when search has no results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({ geonames: [] }),
      })),
    );

    await expect(fetchLocation("Unknownville")).resolves.toMatchObject({
      name: "Unknownville",
    });

    vi.unstubAllGlobals();
  });
});
