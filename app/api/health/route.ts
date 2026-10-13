import { NextResponse } from "next/server";
import { databaseReady } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await databaseReady();
  return NextResponse.json({ ok: database, database }, { status: database ? 200 : 503 });
}
