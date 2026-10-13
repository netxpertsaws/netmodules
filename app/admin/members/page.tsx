import Link from "next/link";
import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { MemberTools } from "@/components/admin/MemberTools";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const query = await searchParams;
  const q = Array.isArray(query.q) ? query.q[0] : query.q;
  const status = Array.isArray(query.status) ? query.status[0] : query.status;
  const rows = await prisma.user.findMany({
    where: {
      role: "MEMBER",
      ...(status ? { status: status as "PENDING" } : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { identityNo: { contains: q, mode: "insensitive" } },
              { profile: { fullName: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { profile: { include: { school: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Members</h1>
        <Link href="/admin/members/new" className="rounded-lg bg-[#13244D] px-3 py-2 text-sm text-white">New member</Link>
      </div>
      <form className="flex gap-2">
        <input className="rounded-lg border px-3 py-2" name="q" placeholder="Search name, email, ID" defaultValue={q ?? ""} />
        <select className="rounded-lg border px-3 py-2" name="status" defaultValue={status ?? ""}>
          <option value="">Any status</option>
          {["PENDING", "APPROVED", "REJECTED", "INACTIVE", "DECEASED"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button className="rounded-lg border px-3" type="submit">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr><th className="p-3">ID</th><th>Name</th><th>Status</th><th>School</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.identityNo ?? "—"}</td>
                <td>{user.profile?.fullName ?? user.email}</td>
                <td>{user.status}</td>
                <td>{user.profile?.school.nameEn}</td>
                <td className="space-y-2 p-3">
                  <Link className="text-[#13244D] underline" href={`/admin/members/${user.id}/edit`}>Edit</Link>
                  <MemberTools userId={user.id} status={user.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
