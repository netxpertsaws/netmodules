import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getRequestIp, getUserAgent } from "@/lib/request-meta";
import { buildViewLog, shouldLogProfileView, shouldWriteView } from "@/lib/view-log";

export async function logActivity(input: {
  action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "VIEW_PROFILE";
  actorId?: string | null;
  targetUserId?: string | null;
}) {
  const headerList = await headers();
  await prisma.activityLog.create({
    data: {
      action: input.action,
      actorId: input.actorId ?? null,
      targetUserId: input.targetUserId ?? null,
      ip: getRequestIp(headerList),
      userAgent: getUserAgent(headerList),
    },
  });
}

/** One VIEW_PROFILE row per real page view. Prefetch and a 10s double-submit are ignored. */
export async function recordProfileView(actorId: string, targetUserId: string) {
  const headerList = await headers();
  if (!shouldLogProfileView(headerList)) return { logged: false as const };
  const recent = await prisma.activityLog.findFirst({
    where: { action: "VIEW_PROFILE", actorId, targetUserId },
    orderBy: { createdAt: "desc" },
  });
  if (!shouldWriteView(recent?.createdAt ?? null, new Date())) return { logged: false as const };
  const entry = buildViewLog({
    actorId,
    targetUserId,
    ip: getRequestIp(headerList),
    userAgent: getUserAgent(headerList),
  });
  await prisma.activityLog.create({ data: entry });
  return { logged: true as const };
}
