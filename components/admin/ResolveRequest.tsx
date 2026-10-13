"use client";

import { useRouter } from "next/navigation";
import { resolveChangeRequest } from "@/app/actions/member-actions";

export function ResolveRequest({ id }: { id: string }) {
  const router = useRouter();
  return (
    <div className="flex gap-2">
      <button className="rounded bg-[#13244D] px-3 py-1 text-xs text-white" type="button" onClick={async () => { await resolveChangeRequest({ id, status: "DONE" }); router.refresh(); }}>Done</button>
      <button className="rounded border px-3 py-1 text-xs" type="button" onClick={async () => { await resolveChangeRequest({ id, status: "REJECTED" }); router.refresh(); }}>Reject</button>
    </div>
  );
}
