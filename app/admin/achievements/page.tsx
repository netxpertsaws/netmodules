import { ContentDesk } from "@/components/admin/ContentDesk";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAchievementsPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.achievement.findMany({ orderBy: { year: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Achievements</h1>
      <ContentDesk kind="achievement" />
      <ul className="space-y-2 text-sm">{rows.map((row) => <li key={row.id} className="rounded bg-white p-3">{row.year} · {row.titleEn}</li>)}</ul>
    </div>
  );
}
