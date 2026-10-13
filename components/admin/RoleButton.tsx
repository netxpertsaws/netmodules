"use client";

import { useRouter } from "next/navigation";
import { promoteAdmin } from "@/app/actions/member-actions";

export function RoleButton({ userId, role }: { userId: string; role: "ADMIN" | "MEMBER" }) {
  const router = useRouter();
  return (
    <button className="rounded border px-2 py-1 text-xs" type="button" onClick={async () => { await promoteAdmin(userId, role); router.refresh(); }}>
      Make {role === "ADMIN" ? "admin" : "member"}
    </button>
  );
}
