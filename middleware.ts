import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { decideAccess } from "@/lib/access-policy";
import { readTotpCookie, TOTP_COOKIE } from "@/lib/signed-cookie";

const { auth } = NextAuth(authConfig);

const ADMIN_SESSION_SECONDS = 60 * 60 * 4;

export default auth(async (request) => {
  const { pathname } = request.nextUrl;
  const sessionUser = request.auth?.user;

  let totpOk = false;
  if (sessionUser?.id && (sessionUser.role === "ADMIN" || sessionUser.role === "SUPER_ADMIN")) {
    totpOk = await readTotpCookie(request.cookies.get(TOTP_COOKIE)?.value, process.env.AUTH_SECRET ?? "", sessionUser.id);
    if (
      sessionUser.loginAt &&
      Date.now() / 1000 - sessionUser.loginAt > ADMIN_SESSION_SECONDS &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/api/auth")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?error=timeout";
      return NextResponse.redirect(url);
    }
  }

  const decision = decideAccess({
    pathname,
    role: sessionUser?.role ?? null,
    status: sessionUser?.status ?? null,
    totpEnabled: sessionUser?.totpEnabled ?? false,
    totpOk,
    mustChangePassword: sessionUser?.mustChangePassword ?? false,
  });

  if (decision.type === "allow") return NextResponse.next();
  if (decision.type === "deny") {
    return NextResponse.json({ error: decision.status === 401 ? "Sign in required" : "Forbidden" }, { status: decision.status });
  }
  const url = request.nextUrl.clone();
  const [path, query] = decision.to.split("?");
  url.pathname = path || "/";
  url.search = query ? `?${query}` : "";
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
