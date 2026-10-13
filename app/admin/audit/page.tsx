import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Audit log</h1>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b"><th className="p-2">When (UTC)</th><th>Who</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-2">{row.createdAt.toISOString()}</td>
                <td>{row.actor.email}</td>
                <td>{row.action}</td>
                <td>{row.entity} {row.entityId ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
