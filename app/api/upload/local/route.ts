import { NextResponse } from "next/server";
import { localUploadAllowed, writeLocalObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "";
  const exp = url.searchParams.get("exp") ?? "";
  const sig = url.searchParams.get("sig") ?? "";
  if (!localUploadAllowed(key, exp, sig)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length < 1 || body.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Images must be 5 MB or smaller" }, { status: 400 });
  }
  await writeLocalObject(key, body);
  return NextResponse.json({ ok: true });
}
