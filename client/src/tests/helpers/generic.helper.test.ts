import { describe, expect, it, vi } from "vitest";
import { debounce } from "@utils";

describe("debounce", () => {
  it("accepts a typed async function and delays the call", () => {
    vi.useFakeTimers();
    const fn = vi.fn(async (query: string) => query.toUpperCase());
    const debounced = debounce(fn, 300);

    debounced("paris");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledWith("paris");

    vi.useRealTimers();
  });
});
