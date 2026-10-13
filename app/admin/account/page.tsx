"use client";

import { useState } from "react";
import { changePasswordAction } from "@/app/actions/auth-actions";

export default function AdminAccountPage() {
  const [message, setMessage] = useState("");
  return (
    <form
      className="max-w-md space-y-3 rounded-xl bg-white p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await changePasswordAction(new FormData(event.currentTarget));
        setMessage(result && "ok" in result ? "Password updated." : "Could not update the password.");
      }}
    >
      <h1 className="text-2xl font-semibold">Change password</h1>
      <input className="w-full rounded border px-3 py-2" name="currentPassword" type="password" placeholder="Current password" required />
      <input className="w-full rounded border px-3 py-2" name="password" type="password" placeholder="New password" required />
      <input className="w-full rounded border px-3 py-2" name="confirmPassword" type="password" placeholder="Confirm" required />
      <button className="rounded bg-[#13244D] px-4 py-2 text-white" type="submit">Save</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
