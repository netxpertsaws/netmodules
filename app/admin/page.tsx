import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { StatusChart } from "@/components/admin/Charts";
import { birthdayWindows, type BirthdayPerson } from "@/lib/birthdays";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const [pending, total, grouped, birthdays] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING", inviteToken: null, role: "MEMBER" } }),
    prisma.user.count({ where: { status: "APPROVED", role: "MEMBER" } }),
    prisma.user.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.memberProfile.findMany({
      where: { user: { status: "APPROVED" } },
      include: { user: { include: { consents: true } }, school: true },
    }),
  ]);
  const people: BirthdayPerson[] = birthdays.map((row) => ({
    id: row.userId,
    fullName: row.fullName,
    nickname: row.nickname,
    identityNo: row.user.identityNo,
    dateOfBirth: row.dateOfBirth,
    schoolName: row.school.nameEn,
    photoUrl: null,
    status: row.user.status,
    birthdayConsent: row.user.consents.some((item) => item.type === "BIRTHDAY" && item.accepted),
  }));
  const today = birthdayWindows(people, new Date(), "Asia/Colombo").today;
  const cards = [
    ["Pending", pending],
    ["Approved members", total],
    ["Birthdays today (Colombo)", today.length],
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <StatusChart data={grouped.map((row) => ({ status: row.status, count: row._count._all }))} />
    </div>
  );
}
