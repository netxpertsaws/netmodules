import { getTranslations } from "next-intl/server";
import { TrophyShelf } from "@/components/3d/TrophyShelf";
import { GlassCard } from "@/components/ui/GlassCard";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.achievement.findMany({ where: { status: "PUBLISHED" }, orderBy: { year: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{t("achievements.title")}</h1>
      <TrophyShelf labels={rows.slice(0, 3).map((row) => (locale === "ta" ? row.titleTa : row.titleEn))} />
      {rows.length ? (
        rows.map((row) => (
          <GlassCard key={row.id}>
            <p className="text-gold">{row.year}</p>
            <h2 className="text-xl font-semibold">{locale === "ta" ? row.titleTa : row.titleEn}</h2>
            <p className="mt-2 text-[var(--muted)]">{locale === "ta" ? row.bodyTa : row.bodyEn}</p>
          </GlassCard>
        ))
      ) : (
        <p className="text-[var(--muted)]">{t("achievements.empty")}</p>
      )}
    </div>
  );
}
