"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireAdmin, requireSuperAdmin, ActionError } from "@/lib/rbac";
import { joinSchema, adminMemberSchema, changeRequestSchema, inviteAcceptSchema } from "@/lib/validation/member";
import { rejectSchema, changeResolveSchema } from "@/lib/validation/content";
import { consentCreates, toProfileCreate } from "@/lib/profile-input";
import { getRequestIp, getUserAgent } from "@/lib/request-meta";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { hashPassword } from "@/lib/password";
import { assignIdentityNo } from "@/lib/identity";
import { writeAudit } from "@/lib/audit";
import { recordProfileView } from "@/lib/activity";
import { approvalEmail, inviteEmail, rejectionEmail, resetEmail, sendEmail } from "@/lib/email";
import { profileWriteStatus } from "@/lib/visibility";

function fail(error: unknown) {
  if (error instanceof ActionError) return { error: error.message, status: error.status };
  console.error(error);
  return { error: "Something went wrong", status: 500 };
}

export async function submitJoin(payload: unknown) {
  const parsed = joinSchema.safeParse(payload);
  if (!parsed.success) return { error: "Please check the form", issues: parsed.error.flatten().fieldErrors };
  if (parsed.data.company) return { ok: true as const, silent: true as const };
  const headerList = await headers();
  const ip = getRequestIp(headerList);
  if (!rateLimit(`join:${ip}`, 5, 60 * 60 * 1000).ok) return { error: "Too many requests. Try again later." };
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return { error: "Spam check failed. Refresh the page and try again." };
  }
  const email = parsed.data.email.toLowerCase();
  const mobile = parsed.data.mobile.replace(/\s+/g, "");
  const duplicate = await prisma.user.findFirst({
    where: { OR: [{ email }, { profile: { mobile } }] },
    select: { id: true, email: true },
  });
  if (duplicate) return { error: "An application with this email or mobile already exists." };
  const fields = toProfileCreate(parsed.data);
  await prisma.user.create({
    data: {
      email,
      name: parsed.data.fullName,
      passwordHash: await hashPassword(parsed.data.password),
      role: "MEMBER",
      status: "PENDING",
      locale: "en",
      profile: { create: fields },
      consents: { create: consentCreates(parsed.data.consents, ip, getUserAgent(headerList)) },
    },
  });
  return { ok: true as const };
}

export async function acceptInvite(payload: unknown) {
  const parsed = inviteAcceptSchema.safeParse(payload);
  if (!parsed.success) return { error: "Please check the form" };
  const user = await prisma.user.findUnique({ where: { inviteToken: parsed.data.token } });
  if (!user || !user.inviteExpires || user.inviteExpires < new Date()) return { error: "This invite has expired." };
  const headerList = await headers();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      status: "APPROVED",
      inviteToken: null,
      inviteExpires: null,
      mustChangePassword: false,
      consents: { create: consentCreates(parsed.data.consents, getRequestIp(headerList), getUserAgent(headerList)) },
    },
  });
  return { ok: true as const };
}

export async function approveMember(userId: string) {
  try {
    const session = await requireAdmin();
    const headerList = await headers();
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true, consents: true } });
    if (!user || user.status !== "PENDING" || user.inviteToken) return { error: "This application cannot be approved." };
    if (!user.consents.some((item) => item.type === "DIRECTORY" && item.accepted)) {
      return { error: "Directory consent is missing." };
    }
    const identityNo = await prisma.$transaction(async (tx) => {
      const number = user.identityNo ?? (await assignIdentityNo(tx));
      await tx.user.update({ where: { id: user.id }, data: { status: "APPROVED", identityNo: number } });
      return number;
    });
    await writeAudit({
      actorId: session.user.id,
      action: "APPROVE_MEMBER",
      entity: "User",
      entityId: user.id,
      after: { identityNo, status: "APPROVED" },
      ip: getRequestIp(headerList),
    });
    const mail = approvalEmail(user.name ?? user.email, identityNo);
    await sendEmail({ to: user.email, ...mail });
    revalidatePath("/admin/approvals");
    return { ok: true as const, identityNo };
  } catch (error) {
    return fail(error);
  }
}

export async function rejectMember(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = rejectSchema.safeParse(payload);
    if (!parsed.success) return { error: "A reason is required" };
    const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
    if (!user || user.status !== "PENDING") return { error: "This application cannot be rejected." };
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "REJECTED", rejectionReason: parsed.data.reason },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "REJECT_MEMBER",
      entity: "User",
      entityId: user.id,
      after: { reason: parsed.data.reason },
      ip: getRequestIp(await headers()),
    });
    const mail = rejectionEmail(user.name ?? user.email, parsed.data.reason);
    await sendEmail({ to: user.email, ...mail });
    revalidatePath("/admin/approvals");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function createMember(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = adminMemberSchema.safeParse(payload);
    if (!parsed.success) return { error: "Please check the form", issues: parsed.error.flatten().fieldErrors };
    const email = parsed.data.email.toLowerCase();
    const mobile = parsed.data.mobile.replace(/\s+/g, "");
    const duplicate = await prisma.user.findFirst({ where: { OR: [{ email }, { profile: { mobile } }] } });
    if (duplicate) return { error: "Email or mobile already exists." };
    const token = randomBytes(32).toString("hex");
    const headerList = await headers();
    const user = await prisma.$transaction(async (tx) => {
      const identityNo = await assignIdentityNo(tx);
      return tx.user.create({
        data: {
          email,
          name: parsed.data.fullName,
          role: "MEMBER",
          status: "PENDING",
          identityNo,
          inviteToken: token,
          inviteExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          profile: { create: toProfileCreate(parsed.data) },
        },
      });
    });
    const link = `${process.env.APP_URL ?? "https://vada9598.online"}/invite/${token}`;
    await sendEmail({ to: email, ...inviteEmail(parsed.data.fullName, link) });
    await writeAudit({
      actorId: session.user.id,
      action: "CREATE_MEMBER",
      entity: "User",
      entityId: user.id,
      after: { email, identityNo: user.identityNo },
      ip: getRequestIp(headerList),
    });
    revalidatePath("/admin/members");
    return { ok: true as const, id: user.id };
  } catch (error) {
    return fail(error);
  }
}

export async function updateMember(payload: unknown) {
  try {
    const session = await requireAdmin();
    if (profileWriteStatus(session.user.role) !== 200) return { error: "Forbidden", status: 403 };
    const parsed = adminMemberSchema.safeParse(payload);
    if (!parsed.success || !parsed.data.userId) return { error: "Please check the form" };
    const existing = await prisma.user.findUnique({ where: { id: parsed.data.userId }, include: { profile: true } });
    if (!existing?.profile) return { error: "Member not found" };
    if (existing.status === "DECEASED") return { error: "Deceased profiles are read-only. Clear the deceased mark first." };
    const mobile = parsed.data.mobile.replace(/\s+/g, "");
    const clash = await prisma.user.findFirst({
      where: {
        id: { not: existing.id },
        OR: [{ email: parsed.data.email.toLowerCase() }, { profile: { mobile } }],
      },
    });
    if (clash) return { error: "Email or mobile already exists." };
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.fullName,
        profile: { update: toProfileCreate(parsed.data) },
      },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "UPDATE_MEMBER",
      entity: "MemberProfile",
      entityId: existing.profile.id,
      before: { email: existing.email, fullName: existing.profile.fullName },
      after: { email: parsed.data.email.toLowerCase(), fullName: parsed.data.fullName },
      ip: getRequestIp(await headers()),
    });
    revalidatePath("/admin/members");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function setMemberStatus(userId: string, status: "INACTIVE" | "APPROVED" | "DECEASED") {
  try {
    const session = await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) return { error: "Member not found" };
    await prisma.user.update({
      where: { id: userId },
      data: {
        status,
        profile:
          status === "DECEASED"
            ? { update: { deceasedAt: new Date() } }
            : status === "APPROVED"
              ? { update: { deceasedAt: null } }
              : undefined,
      },
    });
    await writeAudit({
      actorId: session.user.id,
      action: `SET_STATUS_${status}`,
      entity: "User",
      entityId: userId,
      before: { status: user.status },
      after: { status },
      ip: getRequestIp(await headers()),
    });
    revalidatePath("/admin/members");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function resetMemberPassword(userId: string) {
  try {
    const session = await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Member not found" };
    const temporary = `Vada-${randomBytes(4).toString("hex")}9`;
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(temporary), mustChangePassword: true, failedLoginCount: 0, lockedUntil: null },
    });
    await sendEmail({ to: user.email, ...resetEmail(user.name ?? user.email, temporary) });
    await writeAudit({
      actorId: session.user.id,
      action: "RESET_PASSWORD",
      entity: "User",
      entityId: userId,
      ip: getRequestIp(await headers()),
    });
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function requestChange(payload: unknown) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MEMBER" || session.user.status !== "APPROVED") {
    return { error: "Forbidden", status: 403 };
  }
  const parsed = changeRequestSchema.safeParse(payload);
  if (!parsed.success) return { error: "Write a short note about what should change." };
  await prisma.changeRequest.create({ data: { userId: session.user.id, message: parsed.data.message } });
  return { ok: true as const };
}

export async function resolveChangeRequest(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = changeResolveSchema.safeParse(payload);
    if (!parsed.success) return { error: "Invalid request" };
    await prisma.changeRequest.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        adminNote: parsed.data.adminNote || null,
        resolvedById: session.user.id,
      },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "RESOLVE_CHANGE_REQUEST",
      entity: "ChangeRequest",
      entityId: parsed.data.id,
      after: parsed.data,
      ip: getRequestIp(await headers()),
    });
    revalidatePath("/admin/change-requests");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function updateLocale(locale: "en" | "ta") {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") return { error: "Forbidden", status: 403 };
  await prisma.user.update({ where: { id: session.user.id }, data: { locale } });
  return { ok: true as const };
}

export async function logProfileView(identityNo: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") return { logged: false };
  const target = await prisma.user.findFirst({
    where: { identityNo, status: { in: ["APPROVED", "DECEASED"] } },
    select: { id: true },
  });
  if (!target) return { logged: false };
  return recordProfileView(session.user.id, target.id);
}

export async function memberWriteGuard() {
  const session = await auth();
  const status = profileWriteStatus(session?.user?.role);
  if (status !== 200) return { error: status === 401 ? "Sign in required" : "Forbidden", status };
  return { error: "Member profiles are edited from the admin panel", status: 405 };
}

export async function promoteAdmin(userId: string, role: "ADMIN" | "MEMBER") {
  try {
    const session = await requireSuperAdmin();
    if (userId === session.user.id) return { error: "You cannot change your own role." };
    const before = await prisma.user.findUnique({ where: { id: userId } });
    if (!before || before.role === "SUPER_ADMIN") return { error: "That account cannot be changed." };
    await prisma.user.update({
      where: { id: userId },
      data: { role, totpEnabled: role === "ADMIN" ? before.totpEnabled : false },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "SET_ROLE",
      entity: "User",
      entityId: userId,
      before: { role: before.role },
      after: { role },
      ip: getRequestIp(await headers()),
    });
    revalidatePath("/admin/admins");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}
