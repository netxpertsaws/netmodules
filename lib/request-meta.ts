export function getRequestIp(headerList: { get(name: string): string | null }) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "0.0.0.0";
  return headerList.get("x-real-ip") ?? "0.0.0.0";
}

export function getUserAgent(headerList: { get(name: string): string | null }) {
  return headerList.get("user-agent");
}
