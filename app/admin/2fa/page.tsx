"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyTotpAction } from "@/app/actions/auth-actions";

export default function TwoFactorPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <form
      className="max-w-sm space-y-3 rounded-xl bg-white p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await verifyTotpAction(new FormData(event.currentTarget));
        if (result && "redirectTo" in result && result.redirectTo) {
          router.push(result.redirectTo);
          router.refresh();
          return;
        }
        setError("That code was not accepted.");
      }}
    >
      <h1 className="text-2xl font-semibold">Two-factor check</h1>
      <p className="text-sm text-slate-600">Enter the 6-digit code from your authenticator app.</p>
      <input className="w-full rounded border px-3 py-2 tracking-[0.3em]" name="code" inputMode="numeric" pattern="\d{6}" required />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button className="rounded bg-[#13244D] px-4 py-2 text-white" type="submit">Verify</button>
    </form>
  );
}
