"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveMember, rejectMember } from "@/app/actions/member-actions";

export function ApprovalActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="rounded-lg bg-[#13244D] px-3 py-2 text-sm text-white"
        type="button"
        onClick={async () => {
          const result = await approveMember(userId);
          setMessage(result && "identityNo" in result && result.identityNo ? `Approved ${result.identityNo}` : result?.error ?? "Done");
          router.refresh();
        }}
      >
        Approve
      </button>
      <input className="rounded-lg border px-2 py-2 text-sm" placeholder="Rejection reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      <button
        className="rounded-lg border px-3 py-2 text-sm"
        type="button"
        onClick={async () => {
          const result = await rejectMember({ userId, reason });
          setMessage(result && "ok" in result ? "Rejected" : result?.error ?? "Failed");
          router.refresh();
        }}
      >
        Reject
      </button>
      {message ? <span className="text-sm">{message}</span> : null}
    </div>
  );
}
