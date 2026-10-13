import { NextResponse } from "next/server";
import { aggregateDailyViews } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result = await aggregateDailyViews();
  return NextResponse.json({ ok: true, ...result });
}
