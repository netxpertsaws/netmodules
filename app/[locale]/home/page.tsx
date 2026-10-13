import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { BirthdayCard3D } from "@/components/3d/BirthdayCard3D";
import { TrophyShelf } from "@/components/3d/TrophyShelf";
import { GlassCard } from "@/components/ui/GlassCard";
import { EventDateBlock } from "@/components/ui/EventDateBlock";
import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { birthdayWindows, type BirthdayPerson } from "@/lib/birthdays";
import { readTimeZone } from "@/lib/utils";
import { signedPhotoUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function MemberHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  if (!(await databaseReady())) return <DatabaseNotice />;
  const timeZone = readTimeZone((await cookies()).get("vada-tz")?.value);
  const rows = await prisma.memberProfile.findMany({
    where: { user: { status: "APPROVED", consents: { some: { type: "DIRECTORY", accepted: true } } } },
    include: { user: { include: { consents: true } }, school: true },
  });
  const people: BirthdayPerson[] = rows.map((row) => ({
    id: row.userId,
    fullName: locale === "ta" && row.fullNameTa ? row.fullNameTa : row.fullName,
    nickname: row.nickname,
    identityNo: row.user.identityNo,
    dateOfBirth: row.dateOfBirth,
    schoolName: locale === "ta" ? row.school.nameTa : row.school.nameEn,
    photoUrl: null,
    status: row.user.status,
    birthdayConsent: row.user.consents.some((item) => item.type === "BIRTHDAY" && item.accepted),
  }));
  const windows = birthdayWindows(people, new Date(), timeZone);
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    orderBy: { startsAt: "asc" },
    take: 6,
  });
  const albums = await prisma.album.findMany({ where: { status: "PUBLISHED" }, take: 4, orderBy: { eventDate: "desc" } });
  const covers = await Promise.all(albums.map(async (album) => ({ ...album, image: await signedPhotoUrl(album.coverKey) })));

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">{t("birthdays.today")}</h1>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {windows.today.length ? (
            windows.today.map((person) => (
              <BirthdayCard3D
                key={person.id}
                userId={person.id}
                name={person.fullName}
                school={person.schoolName}
                localDate={`${windows.todayDate.year}-${windows.todayDate.month}-${windows.todayDate.day}`}
              />
            ))
          ) : (
            <p className="text-[var(--muted)]">{t("birthdays.none")}</p>
          )}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">{t("birthdays.upcoming")}</h2>
        <div className="mt-3 space-y-2">
          {windows.upcoming.length ? (
            windows.upcoming.map((day) => (
              <GlassCard key={`${day.date.month}-${day.date.day}`}>
                <p className="text-gold">
                  {day.date.day}/{day.date.month}
                </p>
                <p>{day.people.map((person) => person.fullName).join(", ")}</p>
              </GlassCard>
            ))
          ) : (
            <p className="text-[var(--muted)]">{t("birthdays.none")}</p>
          )}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">{t("events.title")}</h2>
        <div className="mt-3 grid gap-3">
          {events.length ? (
            events.map((event) => (
              <EventDateBlock
                key={event.id}
                iso={event.startsAt.toISOString()}
                timeZone={timeZone}
                title={locale === "ta" ? event.titleTa : event.titleEn}
                location={event.location}
              />
            ))
          ) : (
            <p className="text-[var(--muted)]">{t("events.empty")}</p>
          )}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Link href={`/${locale}/obituaries`} className="glass block p-5">
          <h2 className="text-xl">{t("sections.obituaries")}</h2>
          <p className="text-sm text-[var(--muted)]">{t("sections.open")}</p>
        </Link>
        <Link href={`/${locale}/memoriam`} className="glass block p-5">
          <h2 className="font-serif text-xl">{t("sections.memoriam")}</h2>
          <p className="text-sm text-[var(--muted)]">{t("sections.open")}</p>
        </Link>
        <div>
          <h2 className="mb-3 text-xl">{t("sections.achievements")}</h2>
          <TrophyShelf labels={[t("sections.achievements"), t("sections.album"), t("brand.kicker")]} />
        </div>
        <Link href={`/${locale}/album`} className="glass block p-5">
          <h2 className="text-xl">{t("sections.album")}</h2>
          <p className="text-sm text-[var(--muted)]">{covers.length ? covers.map((album) => (locale === "ta" ? album.titleTa : album.titleEn)).join(" · ") : t("album.empty")}</p>
        </Link>
      </section>
    </div>
  );
}
