import { describe, expect, it } from "vitest";
import { birthdayWindows, isBirthdayOnInstant, occursOnLocalDate } from "@/lib/birthdays";

const october = new Date("1990-10-13T00:00:00.000Z");
const leapDay = new Date("2000-02-29T00:00:00.000Z");

describe("birthday calendar rules", () => {
  it("shows 13 October in Sri Lanka and not yet in Toronto on the same UTC instant", () => {
    const now = new Date("2026-10-12T20:00:00.000Z");
    expect(isBirthdayOnInstant(october, now, "Asia/Colombo")).toBe(true);
    expect(isBirthdayOnInstant(october, now, "America/Toronto")).toBe(false);
  });

  it("shows 13 October in Toronto later the same UTC day", () => {
    const now = new Date("2026-10-13T15:00:00.000Z");
    expect(isBirthdayOnInstant(october, now, "America/Toronto")).toBe(true);
    expect(isBirthdayOnInstant(october, now, "Asia/Colombo")).toBe(true);
  });

  it("observes 29 February on 28 February in a non-leap year", () => {
    expect(occursOnLocalDate(leapDay, { year: 2026, month: 2, day: 28 })).toBe(true);
    expect(occursOnLocalDate(leapDay, { year: 2026, month: 3, day: 1 })).toBe(false);
  });

  it("keeps 29 February on the 29th in a leap year", () => {
    expect(occursOnLocalDate(leapDay, { year: 2028, month: 2, day: 29 })).toBe(true);
    expect(occursOnLocalDate(leapDay, { year: 2028, month: 2, day: 28 })).toBe(false);
  });

  it("excludes deceased members and members without birthday consent", () => {
    const people = [
      person("a", october, "APPROVED", true),
      person("b", october, "DECEASED", true),
      person("c", october, "APPROVED", false),
    ];
    const result = birthdayWindows(people, new Date("2026-10-13T06:00:00.000Z"), "Asia/Colombo");
    expect(result.today.map((item) => item.id)).toEqual(["a"]);
  });
});

function person(id: string, dateOfBirth: Date, status: string, birthdayConsent: boolean) {
  return {
    id,
    fullName: id,
    nickname: null,
    identityNo: "VADA-001",
    dateOfBirth,
    schoolName: "Hartley College",
    photoUrl: null,
    status,
    birthdayConsent,
  };
}
