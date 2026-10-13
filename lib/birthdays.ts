import { toZonedTime } from "date-fns-tz";

export type CalendarDate = { year: number; month: number; day: number };

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Calendar parts of an instant in the viewer's time zone. */
export function zonedParts(instant: Date, timeZone: string): CalendarDate {
  const zoned = toZonedTime(instant, timeZone);
  return {
    year: zoned.getFullYear(),
    month: zoned.getMonth() + 1,
    day: zoned.getDate(),
  };
}

/**
 * Date of birth is a calendar date, stored as UTC midnight of that day
 * (for example 1990-10-13T00:00:00.000Z means 13 October).
 */
export function dobMonthDay(dob: Date) {
  return { month: dob.getUTCMonth() + 1, day: dob.getUTCDate() };
}

export function occursOnLocalDate(dob: Date, local: CalendarDate) {
  const birthday = dobMonthDay(dob);
  if (birthday.month === local.month && birthday.day === local.day) return true;
  // 29 Feb is observed on 28 Feb when the viewer's year is not a leap year.
  if (
    birthday.month === 2 &&
    birthday.day === 29 &&
    !isLeapYear(local.year) &&
    local.month === 2 &&
    local.day === 28
  ) {
    return true;
  }
  return false;
}

export function isBirthdayOnInstant(dob: Date, now: Date, timeZone: string) {
  return occursOnLocalDate(dob, zonedParts(now, timeZone));
}

export function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export type BirthdayPerson = {
  id: string;
  fullName: string;
  nickname: string | null;
  identityNo: string | null;
  dateOfBirth: Date;
  schoolName: string | null;
  photoUrl: string | null;
  status: string;
  birthdayConsent: boolean;
};

export function birthdaysOnLocalDate<T extends BirthdayPerson>(people: T[], local: CalendarDate) {
  return people.filter((person) => {
    if (person.status === "DECEASED") return false;
    if (!person.birthdayConsent) return false;
    return occursOnLocalDate(person.dateOfBirth, local);
  });
}

/** Today, then the following `days` local dates (today is not repeated). */
export function birthdayWindows<T extends BirthdayPerson>(
  people: T[],
  now: Date,
  timeZone: string,
  upcomingDays = 7,
) {
  const today = zonedParts(now, timeZone);
  const upcoming: { date: CalendarDate; people: T[] }[] = [];
  for (let offset = 1; offset <= upcomingDays; offset += 1) {
    const date = addCalendarDays(today, offset);
    const matches = birthdaysOnLocalDate(people, date);
    if (matches.length) upcoming.push({ date, people: matches });
  }
  return { today: birthdaysOnLocalDate(people, today), todayDate: today, upcoming };
}
