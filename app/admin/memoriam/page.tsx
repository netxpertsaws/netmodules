import { ContentDesk } from "@/components/admin/ContentDesk";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMemoriamPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.memoriam.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">In memoriam</h1>
      <ContentDesk kind="memoriam" />
      <ul className="space-y-2 text-sm">{rows.map((row) => <li key={row.id} className="rounded bg-white p-3">{row.nameEn}</li>)}</ul>
    </div>
  );
}
