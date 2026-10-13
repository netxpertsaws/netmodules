import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { EventDateBlock } from "@/components/ui/EventDateBlock";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";
import { readTimeZone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("events");
  if (!(await databaseReady())) return <DatabaseNotice />;
  const timeZone = readTimeZone((await cookies()).get("vada-tz")?.value);
  const events = await prisma.event.findMany({ where: { status: "PUBLISHED" }, orderBy: { startsAt: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      {events.length ? (
        events.map((event) => (
          <div key={event.id} className="space-y-2">
            <EventDateBlock iso={event.startsAt.toISOString()} timeZone={timeZone} title={locale === "ta" ? event.titleTa : event.titleEn} location={event.location} />
            <p className="text-sm text-[var(--muted)]">{locale === "ta" ? event.descriptionTa : event.descriptionEn}</p>
          </div>
        ))
      ) : (
        <p className="text-[var(--muted)]">{t("empty")}</p>
      )}
    </div>
  );
}
