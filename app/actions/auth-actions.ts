"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { assertLoginRate } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { getRequestIp } from "@/lib/request-meta";
import { createTotpSecret, decryptTotpSecret, encryptTotpSecret, totpUri, verifyTotp } from "@/lib/totp";
import { makeTotpCookie, TOTP_COOKIE } from "@/lib/signed-cookie";
import { cookies } from "next/headers";
import QRCode from "qrcode";
import { rateLimit } from "@/lib/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/password";
import { passwordChangeSchema } from "@/lib/validation/member";
import { requireRole } from "@/lib/rbac";
import { writeAudit } from "@/lib/audit";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const headerList = await headers();
  const ip = getRequestIp(headerList);
  if (!(await assertLoginRate(email, ip))) return { error: "rate" as const };
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { error: "invalid" as const };
    throw error;
  }
  const session = await auth();
  if (!session?.user?.id) return { error: "invalid" as const };
  const admin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  if (!admin) await logActivity({ action: "LOGIN", actorId: session.user.id });
  if (admin) {
    return { ok: true as const, redirectTo: session.user.totpEnabled ? "/admin/2fa" : "/admin/2fa/setup" };
  }
  const locale = session.user.locale === "ta" ? "ta" : "en";
  if (session.user.mustChangePassword) return { ok: true as const, redirectTo: `/${locale}/account` };
  return { ok: true as const, redirectTo: `/${locale}/home` };
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutAction() {
  const session = await auth();
  if (session?.user?.id) await logActivity({ action: "LOGOUT", actorId: session.user.id });
  const jar = await cookies();
  jar.delete(TOTP_COOKIE);
  await signOut({ redirectTo: "/" });
}

export async function beginTotpSetup() {
  const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (session.user.totpEnabled) return { error: "already" as const };
  const secret = createTotpSecret();
  const jar = await cookies();
  jar.set("vada_totp_setup", encryptTotpSecret(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  const uri = totpUri(session.user.email ?? "admin", secret);
  return { uri, qr: await QRCode.toDataURL(uri) };
}

const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export async function confirmTotpSetup(formData: FormData) {
  const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const parsed = codeSchema.safeParse({ code: String(formData.get("code") ?? "") });
  if (!parsed.success) return { error: "code" as const };
  const headerList = await headers();
  if (!rateLimit(`totp:${session.user.id}:${getRequestIp(headerList)}`, 6, 10 * 60 * 1000).ok) {
    return { error: "rate" as const };
  }
  const jar = await cookies();
  const pending = jar.get("vada_totp_setup")?.value;
  if (!pending) return { error: "expired" as const };
  const secret = decryptTotpSecret(pending);
  if (!verifyTotp(parsed.data.code, secret)) {
    await logActivity({ action: "LOGIN_FAILED", actorId: session.user.id });
    return { error: "code" as const };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: encryptTotpSecret(secret), totpEnabled: true },
  });
  const cookie = await makeTotpCookie(session.user.id, process.env.AUTH_SECRET ?? "");
  jar.set(TOTP_COOKIE, cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  jar.delete("vada_totp_setup");
  await logActivity({ action: "LOGIN", actorId: session.user.id });
  await writeAudit({
    actorId: session.user.id,
    action: "ENABLE_2FA",
    entity: "User",
    entityId: session.user.id,
    ip: getRequestIp(headerList),
  });
  return { ok: true as const, redirectTo: session.user.mustChangePassword ? "/admin/account" : "/admin" };
}

export async function verifyTotpAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const parsed = codeSchema.safeParse({ code: String(formData.get("code") ?? "") });
  if (!parsed.success) return { error: "code" as const };
  const headerList = await headers();
  if (!rateLimit(`totp:${session.user.id}:${getRequestIp(headerList)}`, 6, 10 * 60 * 1000).ok) {
    return { error: "rate" as const };
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.totpSecret) return { error: "setup" as const };
  if (!verifyTotp(parsed.data.code, decryptTotpSecret(user.totpSecret))) {
    await logActivity({ action: "LOGIN_FAILED", actorId: session.user.id });
    return { error: "code" as const };
  }
  const jar = await cookies();
  jar.set(TOTP_COOKIE, await makeTotpCookie(session.user.id, process.env.AUTH_SECRET ?? ""), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  await logActivity({ action: "LOGIN", actorId: session.user.id });
  return { ok: true as const, redirectTo: session.user.mustChangePassword ? "/admin/account" : "/admin" };
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") return { error: "auth" as const };
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { error: "invalid" as const };
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) return { error: "invalid" as const };
  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) return { error: "current" as const };
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password), mustChangePassword: false },
  });
  await signIn("credentials", { email: user.email, password: parsed.data.password, redirect: false });
  const admin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (admin) {
    await writeAudit({
      actorId: user.id,
      action: "CHANGE_OWN_PASSWORD",
      entity: "User",
      entityId: user.id,
      ip: getRequestIp(await headers()),
    });
  }
  return { ok: true as const };
}
