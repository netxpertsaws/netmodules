"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TimezoneCookie() {
  const router = useRouter();
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie.split("; ").find((row) => row.startsWith("vada-tz="))?.split("=")[1];
    if (current === encodeURIComponent(timeZone)) return;
    document.cookie = `vada-tz=${encodeURIComponent(timeZone)};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }, [router]);
  return null;
}
