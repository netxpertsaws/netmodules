import { ContentDesk } from "@/components/admin/ContentDesk";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Events</h1>
      <ContentDesk kind="event" />
      <ul className="space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.id} className="rounded bg-white p-3">{row.titleEn} · {row.status} · {row.startsAt.toISOString()}</li>
        ))}
      </ul>
    </div>
  );
}
