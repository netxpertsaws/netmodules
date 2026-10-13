import { ContentDesk } from "@/components/admin/ContentDesk";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminObituariesPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.obituary.findMany({ orderBy: { passedOn: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Obituaries</h1>
      <ContentDesk kind="obituary" />
      <ul className="space-y-2 text-sm">{rows.map((row) => <li key={row.id} className="rounded bg-white p-3">{row.nameEn} · {row.status}</li>)}</ul>
    </div>
  );
}
