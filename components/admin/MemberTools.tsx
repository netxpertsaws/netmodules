"use client";

import { useRouter } from "next/navigation";
import { resetMemberPassword, setMemberStatus } from "@/app/actions/member-actions";

export function MemberTools({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "DECEASED" ? (
        <button className="rounded border px-2 py-1 text-xs" type="button" onClick={async () => { await setMemberStatus(userId, "DECEASED"); router.refresh(); }}>
          Mark deceased
        </button>
      ) : (
        <button className="rounded border px-2 py-1 text-xs" type="button" onClick={async () => { await setMemberStatus(userId, "APPROVED"); router.refresh(); }}>
          Restore
        </button>
      )}
      {status === "INACTIVE" ? (
        <button className="rounded border px-2 py-1 text-xs" type="button" onClick={async () => { await setMemberStatus(userId, "APPROVED"); router.refresh(); }}>Activate</button>
      ) : (
        <button className="rounded border px-2 py-1 text-xs" type="button" onClick={async () => { await setMemberStatus(userId, "INACTIVE"); router.refresh(); }}>Deactivate</button>
      )}
      <button className="rounded border px-2 py-1 text-xs" type="button" onClick={async () => { await resetMemberPassword(userId); router.refresh(); }}>
        Reset password
      </button>
    </div>
  );
}
