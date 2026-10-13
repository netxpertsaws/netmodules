"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireApprovedMember, ActionError } from "@/lib/rbac";
import { getRequestIp } from "@/lib/request-meta";
import { writeAudit } from "@/lib/audit";
import {
  achievementSchema,
  albumSchema,
  condolenceSchema,
  eventSchema,
  memoriamSchema,
  obituarySchema,
  photoSchema,
  wishSchema,
} from "@/lib/validation/content";

function fail(error: unknown) {
  if (error instanceof ActionError) return { error: error.message };
  console.error(error);
  return { error: "Something went wrong" };
}

async function audit(action: string, entity: string, entityId: string | null, after: unknown) {
  const session = await requireAdmin();
  await writeAudit({
    actorId: session.user.id,
    action,
    entity,
    entityId,
    after,
    ip: getRequestIp(await headers()),
  });
  return session;
}

export async function saveEvent(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = eventSchema.safeParse(payload);
    if (!parsed.success) return { error: "Check the event fields" };
    const data = {
      titleEn: parsed.data.titleEn,
      titleTa: parsed.data.titleTa,
      descriptionEn: parsed.data.descriptionEn,
      descriptionTa: parsed.data.descriptionTa,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      location: parsed.data.location || null,
      status: parsed.data.status,
    };
    const row = parsed.data.id
      ? await prisma.event.update({ where: { id: parsed.data.id }, data })
      : await prisma.event.create({ data: { ...data, createdById: session.user.id } });
    await audit(parsed.data.id ? "UPDATE_EVENT" : "CREATE_EVENT", "Event", row.id, data);
    revalidatePath("/admin/events");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function saveObituary(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = obituarySchema.safeParse(payload);
    if (!parsed.success) return { error: "Check the obituary fields" };
    const data = {
      memberUserId: parsed.data.memberUserId || null,
      nameEn: parsed.data.nameEn,
      nameTa: parsed.data.nameTa,
      summaryEn: parsed.data.summaryEn,
      summaryTa: parsed.data.summaryTa,
      passedOn: new Date(`${parsed.data.passedOn}T00:00:00.000Z`),
      status: parsed.data.status,
    };
    const row = parsed.data.id
      ? await prisma.obituary.update({ where: { id: parsed.data.id }, data })
      : await prisma.obituary.create({ data: { ...data, createdById: session.user.id } });
    await audit(parsed.data.id ? "UPDATE_OBITUARY" : "CREATE_OBITUARY", "Obituary", row.id, data);
    revalidatePath("/admin/obituaries");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function saveAchievement(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = achievementSchema.safeParse(payload);
    if (!parsed.success) return { error: "Check the achievement fields" };
    const data = {
      memberUserId: parsed.data.memberUserId || null,
      titleEn: parsed.data.titleEn,
      titleTa: parsed.data.titleTa,
      bodyEn: parsed.data.bodyEn,
      bodyTa: parsed.data.bodyTa,
      year: parsed.data.year,
      status: parsed.data.status,
    };
    const row = parsed.data.id
      ? await prisma.achievement.update({ where: { id: parsed.data.id }, data })
      : await prisma.achievement.create({ data: { ...data, createdById: session.user.id } });
    await audit(parsed.data.id ? "UPDATE_ACHIEVEMENT" : "CREATE_ACHIEVEMENT", "Achievement", row.id, data);
    revalidatePath("/admin/achievements");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function saveMemoriam(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = memoriamSchema.safeParse(payload);
    if (!parsed.success) return { error: "Check the tribute fields" };
    const data = {
      nameEn: parsed.data.nameEn,
      nameTa: parsed.data.nameTa,
      tributeEn: parsed.data.tributeEn,
      tributeTa: parsed.data.tributeTa,
      years: parsed.data.years || null,
      status: parsed.data.status,
    };
    const row = parsed.data.id
      ? await prisma.memoriam.update({ where: { id: parsed.data.id }, data })
      : await prisma.memoriam.create({ data: { ...data, createdById: session.user.id } });
    await audit(parsed.data.id ? "UPDATE_MEMORIAM" : "CREATE_MEMORIAM", "Memoriam", row.id, data);
    revalidatePath("/admin/memoriam");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function saveAlbum(payload: unknown) {
  try {
    const session = await requireAdmin();
    const parsed = albumSchema.safeParse(payload);
    if (!parsed.success) return { error: "Check the album fields" };
    const data = {
      titleEn: parsed.data.titleEn,
      titleTa: parsed.data.titleTa,
      coverKey: parsed.data.coverKey || null,
      eventDate: parsed.data.eventDate ? new Date(`${parsed.data.eventDate}T00:00:00.000Z`) : null,
      status: parsed.data.status,
    };
    const row = parsed.data.id
      ? await prisma.album.update({ where: { id: parsed.data.id }, data })
      : await prisma.album.create({ data: { ...data, createdById: session.user.id } });
    await audit(parsed.data.id ? "UPDATE_ALBUM" : "CREATE_ALBUM", "Album", row.id, data);
    revalidatePath("/admin/albums");
    return { ok: true as const, id: row.id };
  } catch (error) {
    return fail(error);
  }
}

export async function addPhoto(payload: unknown) {
  try {
    await requireAdmin();
    const parsed = photoSchema.safeParse(payload);
    if (!parsed.success) return { error: "Check the photo" };
    const photo = await prisma.photo.create({
      data: {
        albumId: parsed.data.albumId,
        key: parsed.data.key,
        captionEn: parsed.data.captionEn || null,
        captionTa: parsed.data.captionTa || null,
      },
    });
    await audit("ADD_PHOTO", "Photo", photo.id, { albumId: parsed.data.albumId });
    revalidatePath("/admin/albums");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function addCondolence(payload: unknown) {
  try {
    const session = await requireApprovedMember();
    const parsed = condolenceSchema.safeParse(payload);
    if (!parsed.success) return { error: "Write a short message" };
    const obituary = await prisma.obituary.findFirst({ where: { id: parsed.data.obituaryId, status: "PUBLISHED" } });
    if (!obituary) return { error: "Not found" };
    await prisma.condolence.create({
      data: { obituaryId: obituary.id, userId: session.user.id, message: parsed.data.message },
    });
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function sendWish(payload: unknown) {
  try {
    const session = await requireApprovedMember();
    const parsed = wishSchema.safeParse(payload);
    if (!parsed.success) return { error: "Write a short wish" };
    if (parsed.data.toUserId === session.user.id) return { error: "You cannot wish yourself" };
    const year = new Date().getUTCFullYear();
    await prisma.birthdayWish.upsert({
      where: { fromUserId_toUserId_year: { fromUserId: session.user.id, toUserId: parsed.data.toUserId, year } },
      update: { message: parsed.data.message },
      create: { fromUserId: session.user.id, toUserId: parsed.data.toUserId, year, message: parsed.data.message },
    });
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}
