import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";

export async function reportSnapshot() {
  const [users, views, recent] = await Promise.all([
    prisma.user.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.dailyViewStats.findMany({ orderBy: { date: "desc" }, take: 400 }),
    prisma.activityLog.count({ where: { action: "VIEW_PROFILE" } }),
  ]);
  const byProfile = new Map<string, { views: number; unique: number }>();
  const byDate = new Map<string, number>();
  for (const row of views) {
    const key = row.date.toISOString().slice(0, 10);
    byDate.set(key, (byDate.get(key) ?? 0) + row.viewCount);
    const current = byProfile.get(row.profileUserId) ?? { views: 0, unique: 0 };
    current.views += row.viewCount;
    current.unique += row.uniqueViewers;
    byProfile.set(row.profileUserId, current);
  }
  const mostViewed = [...byProfile.entries()].sort((a, b) => b[1].views - a[1].views).slice(0, 10);
  const identities = await prisma.user.findMany({
    where: { id: { in: mostViewed.map(([id]) => id) } },
    select: { id: true, identityNo: true, name: true },
  });
  const names = new Map(identities.map((user) => [user.id, user.identityNo ?? user.name ?? user.id]));
  return {
    statuses: users.map((row) => ({ status: row.status, count: row._count._all })),
    totalProfileViews: recent,
    byDate: [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    mostViewed: mostViewed.map(([id, stats]) => ({ id, label: names.get(id) ?? id, ...stats })),
  };
}

export function reportCsv(snapshot: Awaited<ReturnType<typeof reportSnapshot>>) {
  const lines = ["section,key,value"];
  for (const status of snapshot.statuses) lines.push(`status,${status.status},${status.count}`);
  lines.push(`totals,profile_views,${snapshot.totalProfileViews}`);
  for (const [date, count] of snapshot.byDate) lines.push(`day,${date},${count}`);
  for (const row of snapshot.mostViewed) lines.push(`most_viewed,${row.label},${row.views}`);
  return lines.join("\n");
}

export async function reportPdf(snapshot: Awaited<ReturnType<typeof reportSnapshot>>) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let y = 800;
  const write = (text: string, size = 12) => {
    page.drawText(text, { x: 48, y, size, font, color: rgb(0.05, 0.1, 0.2) });
    y -= size + 8;
  };
  write("Vada 9598 — profile view report", 18);
  write(`Generated ${new Date().toISOString()}`);
  write(`Total profile views recorded: ${snapshot.totalProfileViews}`);
  for (const status of snapshot.statuses) write(`${status.status}: ${status.count}`);
  write("Most viewed");
  for (const row of snapshot.mostViewed) write(`${row.label}: ${row.views} views`);
  return Buffer.from(await doc.save());
}
