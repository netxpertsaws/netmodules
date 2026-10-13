import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "V";
}

export function formatIdentityNo(n: number) {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error("Identity numbers start at 1");
  }
  return `VADA-${String(n).padStart(3, "0")}`;
}

export function readTimeZone(value: string | undefined) {
  const decoded = value ? decodeURIComponent(value) : "Asia/Colombo";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: decoded });
    return decoded;
  } catch {
    return "Asia/Colombo";
  }
}

export function parseIdentitySequence(identityNo: string) {
  const match = /^VADA-(\d+)$/.exec(identityNo);
  if (!match) return null;
  return Number(match[1]);
}
