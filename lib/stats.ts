import "server-only";
import { prisma } from "@/lib/prisma";

function utcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Fill DailyViewStats for one UTC day from VIEW_PROFILE activity. */
export async function aggregateDailyViews(day = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
  const start = utcDay(day);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const logs = await prisma.activityLog.findMany({
    where: {
      action: "VIEW_PROFILE",
      createdAt: { gte: start, lt: end },
      targetUserId: { not: null },
    },
    select: { targetUserId: true, actorId: true },
  });
  const grouped = new Map<string, { views: number; actors: Set<string> }>();
  for (const log of logs) {
    if (!log.targetUserId) continue;
    const bucket = grouped.get(log.targetUserId) ?? { views: 0, actors: new Set<string>() };
    bucket.views += 1;
    if (log.actorId) bucket.actors.add(log.actorId);
    grouped.set(log.targetUserId, bucket);
  }
  for (const [profileUserId, bucket] of grouped) {
    await prisma.dailyViewStats.upsert({
      where: { date_profileUserId: { date: start, profileUserId } },
      update: { viewCount: bucket.views, uniqueViewers: bucket.actors.size },
      create: {
        date: start,
        profileUserId,
        viewCount: bucket.views,
        uniqueViewers: bucket.actors.size,
      },
    });
  }
  return { date: start.toISOString().slice(0, 10), profiles: grouped.size };
}
