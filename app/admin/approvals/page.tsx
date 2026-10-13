import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { ApprovalActions } from "@/components/admin/ApprovalActions";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.user.findMany({
    where: { status: "PENDING", role: "MEMBER", inviteToken: null },
    include: { profile: { include: { school: true } } },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Approvals</h1>
      {rows.map((user) => (
        <article key={user.id} className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold">{user.profile?.fullName ?? user.email}</h2>
          <p className="text-sm text-slate-600">{user.email} · {user.profile?.school.nameEn} · {user.profile?.city}, {user.profile?.country}</p>
          <p className="mt-2 text-sm">{user.profile?.about}</p>
          <div className="mt-3">
            <ApprovalActions userId={user.id} />
          </div>
        </article>
      ))}
      {!rows.length ? <p>No applications waiting.</p> : null}
    </div>
  );
}
