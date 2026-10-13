import { NextResponse } from "next/server";
import { z } from "zod";
import { createUploadTarget } from "@/lib/storage";
import { getRequestIp } from "@/lib/request-meta";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  contentLength: z.number().int().positive().max(5 * 1024 * 1024),
});

export async function POST(request: Request) {
  const ip = getRequestIp(request.headers);
  if (!rateLimit(`upload:${ip}`, 20, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  try {
    const target = await createUploadTarget(parsed.data.contentType, parsed.data.contentLength);
    return NextResponse.json(target);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
