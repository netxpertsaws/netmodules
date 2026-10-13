"use client";

import { useEffect, useRef } from "react";
import { logProfileView } from "@/app/actions/member-actions";

export function ProfileViewLogger({ identityNo }: { identityNo: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void logProfileView(identityNo);
  }, [identityNo]);
  return null;
}
