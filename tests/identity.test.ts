import { describe, expect, it } from "vitest";
import { formatIdentityNo, parseIdentitySequence } from "@/lib/utils";
import { isRateLimited } from "@/lib/rate-limit";

describe("identity numbers", () => {
  it("formats and parses VADA-001 without reuse gaps in the formatter", () => {
    expect(formatIdentityNo(1)).toBe("VADA-001");
    expect(formatIdentityNo(42)).toBe("VADA-042");
    expect(formatIdentityNo(1000)).toBe("VADA-1000");
    expect(parseIdentitySequence("VADA-042")).toBe(42);
    expect(parseIdentitySequence("vada-1")).toBeNull();
  });
});

describe("rate limit", () => {
  it("limits once the window is full", () => {
    const now = 10_000;
    expect(isRateLimited([9_000, 9_500], now, 3, 5_000).limited).toBe(false);
    expect(isRateLimited([9_000, 9_500, 9_900], now, 3, 5_000).limited).toBe(true);
    expect(isRateLimited([1_000, 9_500, 9_900], now, 3, 5_000).limited).toBe(false);
  });
});
