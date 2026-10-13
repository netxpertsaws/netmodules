import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { profileWriteStatus } from "@/lib/visibility";

export const dynamic = "force-dynamic";

/** Generic profile writes are refused. Members receive 403; admins use /admin/members. */
export async function POST() {
  const session = await auth();
  const status = profileWriteStatus(session?.user?.role);
  if (status !== 200) {
    return NextResponse.json({ error: status === 401 ? "Sign in required" : "Forbidden" }, { status });
  }
  return NextResponse.json({ error: "Edit members from the admin panel" }, { status: 405 });
}
