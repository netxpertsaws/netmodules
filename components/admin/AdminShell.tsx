import Link from "next/link";
import { logoutAction } from "@/app/actions/auth-actions";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/approvals", "Approvals"],
  ["/admin/members", "Members"],
  ["/admin/change-requests", "Change requests"],
  ["/admin/events", "Events"],
  ["/admin/obituaries", "Obituaries"],
  ["/admin/achievements", "Achievements"],
  ["/admin/memoriam", "In memoriam"],
  ["/admin/albums", "Albums"],
  ["/admin/audit", "Audit log"],
];

export function AdminShell({
  role,
  children,
}: {
  role: "ADMIN" | "SUPER_ADMIN";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#14203a]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="space-y-1 text-sm">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#8a6a22]">Vada admin</p>
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="block rounded-lg px-3 py-2 hover:bg-white">
              {label}
            </Link>
          ))}
          {role === "SUPER_ADMIN" ? (
            <>
              <Link href="/admin/reports" className="block rounded-lg px-3 py-2 hover:bg-white">Reports</Link>
              <Link href="/admin/admins" className="block rounded-lg px-3 py-2 hover:bg-white">Admins</Link>
            </>
          ) : null}
          <Link href="/admin/account" className="block rounded-lg px-3 py-2 hover:bg-white">Password</Link>
          <form action={logoutAction}>
            <button className="px-3 py-2 text-left" type="submit">Sign out</button>
          </form>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
