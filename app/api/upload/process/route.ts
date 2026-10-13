import { NextResponse } from "next/server";
import { z } from "zod";
import { processUpload } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ key: z.string().regex(/^incoming\/[0-9a-f-]{36}$/) });

export async function POST(request: Request) {
  const ip = getRequestIp(request.headers);
  if (!rateLimit(`process:${ip}`, 20, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  try {
    const result = await processUpload(parsed.data.key);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not process image";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
