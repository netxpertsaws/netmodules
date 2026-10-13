const DEDUPE_MS = 10_000;

export function shouldLogProfileView(headerList: { get(name: string): string | null }) {
  if (headerList.get("next-router-prefetch") === "1") return false;
  if (headerList.get("x-middleware-prefetch") === "1") return false;
  const purpose = headerList.get("purpose") ?? headerList.get("sec-purpose");
  if (purpose && purpose.toLowerCase().includes("prefetch")) return false;
  return true;
}

export function shouldWriteView(recentCreatedAt: Date | null, now: Date) {
  if (!recentCreatedAt) return true;
  return now.getTime() - recentCreatedAt.getTime() > DEDUPE_MS;
}

export function buildViewLog(input: {
  actorId: string;
  targetUserId: string;
  ip: string | null;
  userAgent: string | null;
  createdAt?: Date;
}) {
  return {
    action: "VIEW_PROFILE" as const,
    actorId: input.actorId,
    targetUserId: input.targetUserId,
    ip: input.ip,
    userAgent: input.userAgent,
    createdAt: input.createdAt ?? new Date(),
  };
}
