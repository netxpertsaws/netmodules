import "server-only";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { readTotpCookie, TOTP_COOKIE } from "@/lib/signed-cookie";
import type { AppRole } from "@/lib/access-policy";

export class ActionError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new ActionError("Sign in required", 401);
  if (session.user.status !== "APPROVED") throw new ActionError("Account is not approved", 403);
  return session;
}

export async function requireApprovedMember() {
  return requireUser();
}

export async function requireRole(roles: AppRole[]) {
  const session = await requireUser();
  if (!roles.includes(session.user.role)) throw new ActionError("You cannot do that", 403);
  return session;
}

async function totpOk(userId: string) {
  const jar = await cookies();
  const secret = process.env.AUTH_SECRET ?? "";
  return readTotpCookie(jar.get(TOTP_COOKIE)?.value, secret, userId);
}

/** Admin surfaces require an approved admin session plus a verified TOTP cookie. */
export async function requireAdmin(options?: { allowPasswordChange?: boolean }) {
  const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!(await totpOk(session.user.id))) throw new ActionError("Two-factor authentication required", 403);
  if (session.user.mustChangePassword && !options?.allowPasswordChange) {
    throw new ActionError("Change your password first", 403);
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (session.user.role !== "SUPER_ADMIN") throw new ActionError("Super Admin only", 403);
  return session;
}
