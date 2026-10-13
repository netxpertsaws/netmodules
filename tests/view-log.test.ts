import { describe, expect, it } from "vitest";
import { buildViewLog, shouldLogProfileView, shouldWriteView } from "@/lib/view-log";

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name.toLowerCase()] ?? null };
}

describe("profile view log", () => {
  it("builds exactly one VIEW_PROFILE row", () => {
    const row = buildViewLog({
      actorId: "actor",
      targetUserId: "target",
      ip: "127.0.0.1",
      userAgent: "test",
      createdAt: new Date("2026-10-13T00:00:00.000Z"),
    });
    expect(row).toEqual({
      action: "VIEW_PROFILE",
      actorId: "actor",
      targetUserId: "target",
      ip: "127.0.0.1",
      userAgent: "test",
      createdAt: new Date("2026-10-13T00:00:00.000Z"),
    });
  });

  it("does not log router prefetches", () => {
    expect(shouldLogProfileView(headers({ "next-router-prefetch": "1" }))).toBe(false);
    expect(shouldLogProfileView(headers({ purpose: "prefetch" }))).toBe(false);
    expect(shouldLogProfileView(headers({}))).toBe(true);
  });

  it("dedupes a second write inside ten seconds", () => {
    const now = new Date("2026-10-13T00:00:10.000Z");
    expect(shouldWriteView(new Date("2026-10-13T00:00:05.000Z"), now)).toBe(false);
    expect(shouldWriteView(new Date("2026-10-13T00:00:00.000Z"), now)).toBe(false);
    expect(shouldWriteView(new Date("2026-10-12T23:59:00.000Z"), now)).toBe(true);
    expect(shouldWriteView(null, now)).toBe(true);
  });
});
