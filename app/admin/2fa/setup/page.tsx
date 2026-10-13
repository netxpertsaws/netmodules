"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { beginTotpSetup, confirmTotpSetup } from "@/app/actions/auth-actions";

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="max-w-md space-y-4 rounded-xl bg-white p-4">
      <h1 className="text-2xl font-semibold">Set up two-factor authentication</h1>
      <p className="text-sm text-slate-600">Administrators cannot use the panel until this is on.</p>
      <button
        className="rounded bg-[#13244D] px-4 py-2 text-white"
        type="button"
        onClick={async () => {
          const result = await beginTotpSetup();
          if (result && "qr" in result && result.qr) setQr(result.qr);
          else setError("Setup could not start.");
        }}
      >
        Generate secret
      </button>
      {qr ? (
        <div
          role="img"
          aria-label="Authenticator QR code"
          className="h-48 w-48 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${qr})` }}
        />
      ) : null}
      <form
        className="space-y-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await confirmTotpSetup(new FormData(event.currentTarget));
          if (result && "redirectTo" in result && result.redirectTo) {
            router.push(result.redirectTo);
            router.refresh();
            return;
          }
          setError("Enter the current 6-digit code.");
        }}
      >
        <input className="w-full rounded border px-3 py-2" name="code" inputMode="numeric" pattern="\d{6}" placeholder="123456" required />
        <button className="rounded border px-4 py-2" type="submit">Confirm</button>
      </form>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
