export type AppRole = "MEMBER" | "ADMIN" | "SUPER_ADMIN";
export type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE" | "DECEASED";

export type AccessInput = {
  pathname: string;
  role?: AppRole | null;
  status?: AppStatus | null;
  totpEnabled?: boolean;
  totpOk?: boolean;
  mustChangePassword?: boolean;
};

export type AccessDecision = { type: "allow" } | { type: "redirect"; to: string } | { type: "deny"; status: 401 | 403 };

const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/upload",
  "/api/media",
  "/api/schools",
  "/invite",
  "/_next",
];

const PUBLIC_EXACT = new Set(["/", "/login", "/thank-you", "/favicon.ico"]);

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix));
}

export function decideAccess(input: AccessInput): AccessDecision {
  const pathname = input.pathname.split("?")[0] || "/";
  if (pathname.startsWith("/api/cron")) return { type: "allow" };
  if (isPublic(pathname) || pathname.startsWith("/dev")) return { type: "allow" };

  const role = input.role ?? null;
  const isApi = pathname.startsWith("/api/");
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const memberMatch = pathname.match(/^\/(en|ta)(\/|$)/);

  if (!isAdmin && !memberMatch) return { type: "allow" };

  if (!role) {
    if (isApi) return { type: "deny", status: 401 };
    const next = encodeURIComponent(pathname);
    return { type: "redirect", to: `/login?callbackUrl=${next}` };
  }

  if (input.status !== "APPROVED") {
    if (isApi) return { type: "deny", status: 403 };
    return { type: "redirect", to: "/login?error=pending" };
  }

  if (memberMatch) {
    if (role === "MEMBER" && input.mustChangePassword && !pathname.match(/^\/(en|ta)\/account\/?$/)) {
      return { type: "redirect", to: `/${memberMatch[1]}/account` };
    }
    return { type: "allow" };
  }

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    if (isApi) return { type: "deny", status: 403 };
    return { type: "redirect", to: "/login?error=forbidden" };
  }

  const onTwoFactor = pathname.startsWith("/admin/2fa");
  if (!input.totpOk && !onTwoFactor) {
    if (isApi) return { type: "deny", status: 403 };
    return { type: "redirect", to: input.totpEnabled ? "/admin/2fa" : "/admin/2fa/setup" };
  }

  if (input.mustChangePassword && input.totpOk && !onTwoFactor && pathname !== "/admin/account") {
    if (isApi) return { type: "deny", status: 403 };
    return { type: "redirect", to: "/admin/account" };
  }

  const superOnly = pathname.startsWith("/admin/reports") || pathname.startsWith("/admin/admins") || pathname.startsWith("/api/admin/reports");
  if (superOnly && role !== "SUPER_ADMIN") {
    if (isApi) return { type: "deny", status: 403 };
    return { type: "redirect", to: "/admin?error=super" };
  }

  return { type: "allow" };
}
