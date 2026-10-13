import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { RoleButton } from "@/components/admin/RoleButton";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN", "MEMBER"] }, status: "APPROVED" },
    orderBy: { role: "asc" },
    take: 100,
  });
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Administrators</h1>
      <p className="text-sm text-slate-600">Super Admin is Mayooran. Promoting someone requires them to turn on two-factor authentication before the admin panel opens.</p>
      <ul className="space-y-2">
        {rows.map((user) => (
          <li key={user.id} className="flex items-center justify-between rounded bg-white p-3 text-sm">
            <span>{user.name} · {user.email} · {user.role}</span>
            {user.role === "SUPER_ADMIN" ? null : user.role === "ADMIN" ? <RoleButton userId={user.id} role="MEMBER" /> : <RoleButton userId={user.id} role="ADMIN" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
