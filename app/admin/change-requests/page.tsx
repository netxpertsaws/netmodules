import Link from "next/link";
import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { ResolveRequest } from "@/components/admin/ResolveRequest";

export const dynamic = "force-dynamic";

export default async function ChangeRequestsPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.changeRequest.findMany({
    where: { status: "OPEN" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Change requests</h1>
      {rows.map((row) => (
        <article key={row.id} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="font-medium">{row.user.name} · {row.user.identityNo}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{row.message}</p>
          <div className="mt-3 flex items-center gap-3">
            <Link className="text-sm underline" href={`/admin/members/${row.userId}/edit`}>Open member</Link>
            <ResolveRequest id={row.id} />
          </div>
        </article>
      ))}
      {!rows.length ? <p>Inbox is clear.</p> : null}
    </div>
  );
}
