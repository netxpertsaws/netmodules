import { NextResponse } from "next/server";
import { mediaSignatureValid, readPhoto } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "";
  const exp = url.searchParams.get("exp") ?? "";
  const sig = url.searchParams.get("sig") ?? "";
  if (!mediaSignatureValid(key, exp, sig)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await readPhoto(key);
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, max-age=60",
    },
  });
}
