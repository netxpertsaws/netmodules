"use client";

import { formatInTimeZone } from "date-fns-tz";

export function EventDateBlock({
  iso,
  timeZone,
  title,
  location,
}: {
  iso: string;
  timeZone: string;
  title: string;
  location?: string | null;
}) {
  const date = new Date(iso);
  const day = formatInTimeZone(date, timeZone, "dd");
  const month = formatInTimeZone(date, timeZone, "MMM");
  const time = formatInTimeZone(date, timeZone, "HH:mm");
  return (
    <article className="glass flex gap-4 p-4">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gold text-navy-900">
        <span className="text-2xl font-semibold leading-none">{day}</span>
        <span className="text-xs uppercase tracking-wider">{month}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-[var(--muted)]">
          {time}
          {location ? ` · ${location}` : ""}
        </p>
      </div>
    </article>
  );
}
