import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toViewerProfile, type ProfileSource, type ViewerRole } from "@/lib/visibility";
import { signedPhotoUrl, thumbKeyFor } from "@/lib/storage";

const profileInclude = {
  user: { include: { consents: true } },
  school: true,
} satisfies Prisma.MemberProfileInclude;

type Row = Prisma.MemberProfileGetPayload<{ include: typeof profileInclude }>;

export function rowToSource(row: Row): ProfileSource {
  const consent = (type: string) => row.user.consents.some((item) => item.type === type && item.accepted);
  return {
    fullName: row.fullName,
    fullNameTa: row.fullNameTa,
    nickname: row.nickname,
    gender: row.gender,
    dateOfBirth: row.dateOfBirth,
    schoolId: row.schoolId,
    schoolNameEn: row.school.nameEn,
    schoolNameTa: row.school.nameTa,
    alStream: row.alStream,
    admissionNo: row.admissionNo,
    city: row.city,
    country: row.country,
    address: row.address,
    mobile: row.mobile,
    whatsapp: row.whatsapp,
    email: row.user.email,
    profession: row.profession,
    employer: row.employer,
    jobTitle: row.jobTitle,
    maritalStatus: row.maritalStatus,
    spouseName: row.spouseName,
    children: row.children,
    about: row.about,
    facebook: row.facebook,
    linkedin: row.linkedin,
    instagram: row.instagram,
    website: row.website,
    photoKey: row.photoKey,
    photoConsent: consent("PHOTO"),
    birthdayConsent: consent("BIRTHDAY"),
    contactConsent: consent("CONTACT"),
    visibility: row.visibility as ProfileSource["visibility"],
    status: row.user.status,
    identityNo: row.user.identityNo,
    deceasedAt: row.deceasedAt,
  };
}

export async function withPhoto(source: ProfileSource, role: ViewerRole) {
  const profile = toViewerProfile(source, role);
  const photoUrl = profile.photoKey ? await signedPhotoUrl(profile.photoKey) : null;
  const thumbUrl = profile.photoKey ? await signedPhotoUrl(thumbKeyFor(profile.photoKey)) : null;
  return { ...profile, userId: undefined as string | undefined, photoUrl, thumbUrl };
}

export async function loadViewerProfile(identityNo: string, role: ViewerRole) {
  const row = await prisma.memberProfile.findFirst({
    where: {
      user: {
        identityNo,
        status: { in: ["APPROVED", "DECEASED"] },
        consents: { some: { type: "DIRECTORY", accepted: true } },
      },
    },
    include: profileInclude,
  });
  if (!row) return null;
  const view = await withPhoto(rowToSource(row), role);
  return { ...view, userId: row.userId };
}

export async function searchDirectory(input: {
  q?: string;
  schoolId?: string;
  country?: string;
  city?: string;
  profession?: string;
  alStream?: string;
  page?: number;
  role: ViewerRole;
}) {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = 12;
  const where: Prisma.MemberProfileWhereInput = {
    user: {
      status: { in: ["APPROVED", "DECEASED"] },
      consents: { some: { type: "DIRECTORY", accepted: true } },
    },
    ...(input.schoolId ? { schoolId: input.schoolId } : {}),
    ...(input.country ? { country: { equals: input.country, mode: "insensitive" } } : {}),
    ...(input.city ? { city: { equals: input.city, mode: "insensitive" } } : {}),
    ...(input.profession ? { profession: { equals: input.profession, mode: "insensitive" } } : {}),
    ...(input.alStream ? { alStream: input.alStream as Prisma.MemberProfileWhereInput["alStream"] } : {}),
    ...(input.q
      ? {
          OR: [
            { fullName: { contains: input.q, mode: "insensitive" } },
            { nickname: { contains: input.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.memberProfile.count({ where }),
    prisma.memberProfile.findMany({
      where,
      include: profileInclude,
      orderBy: { fullName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const members = await Promise.all(
    rows.map(async (row) => {
      const view = await withPhoto(rowToSource(row), input.role);
      return { ...view, userId: row.userId };
    }),
  );
  return { members, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}
