import { describe, expect, it } from "vitest";
import {
  searchParamsFromTableView,
  tableViewFromSearchParams,
} from "./tableViewState.ts";

describe("tableViewState", () => {
  it("round-trips search, sort, filters, and page", () => {
    const view = {
      query: "vega",
      sort: { columnId: "applied", direction: "desc" as const },
      filters: {
        status: ["Applied", "Rejected"],
        location: ["Bengaluru, India"],
      },
      page: 3,
    };

    const params = searchParamsFromTableView(view);
    expect(params.get("q")).toBe("vega");
    expect(params.get("sort")).toBe("applied");
    expect(params.get("dir")).toBe("desc");
    expect(params.get("page")).toBe("3");
    expect(params.getAll("filter.status")).toEqual(["Applied", "Rejected"]);
    expect(params.get("filter.location")).toBe("Bengaluru, India");

    expect(tableViewFromSearchParams(params)).toEqual(view);
  });

  it("omits default page and empty query", () => {
    const params = searchParamsFromTableView({
      query: "  ",
      sort: null,
      filters: { status: [] },
      page: 1,
    });

    expect([...params.keys()]).toEqual([]);
  });
});
