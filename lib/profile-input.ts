import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { CONSENT_NOTICE_VERSION, memberFieldsSchema } from "@/lib/validation/member";

type Fields = z.infer<typeof memberFieldsSchema>;

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toProfileCreate(fields: Fields): Prisma.MemberProfileCreateWithoutUserInput {
  return {
    fullName: fields.fullName,
    fullNameTa: emptyToNull(fields.fullNameTa),
    nickname: emptyToNull(fields.nickname),
    gender: fields.gender,
    dateOfBirth: new Date(`${fields.dateOfBirth}T00:00:00.000Z`),
    school: { connect: { id: fields.schoolId } },
    alStream: fields.alStream,
    admissionNo: emptyToNull(fields.admissionNo),
    city: fields.city,
    country: fields.country,
    address: emptyToNull(fields.address),
    mobile: fields.mobile.replace(/\s+/g, ""),
    whatsapp: emptyToNull(fields.whatsapp)?.replace(/\s+/g, "") ?? null,
    profession: fields.profession,
    employer: emptyToNull(fields.employer),
    jobTitle: emptyToNull(fields.jobTitle),
    maritalStatus: fields.maritalStatus,
    spouseName: emptyToNull(fields.spouseName),
    children: emptyToNull(fields.children),
    about: emptyToNull(fields.about),
    facebook: emptyToNull(fields.facebook),
    linkedin: emptyToNull(fields.linkedin),
    instagram: emptyToNull(fields.instagram),
    website: emptyToNull(fields.website),
    photoKey: emptyToNull(fields.photoKey),
    visibility: fields.visibility,
  };
}

export function consentCreates(
  consents: { directory: boolean; photo: boolean; birthday: boolean; contact: boolean; accuracy: boolean },
  ip: string,
  userAgent: string | null,
) {
  const rows = [
    ["DIRECTORY", consents.directory],
    ["PHOTO", consents.photo],
    ["BIRTHDAY", consents.birthday],
    ["CONTACT", consents.contact],
    ["ACCURACY", consents.accuracy],
  ] as const;
  return rows.map(([type, accepted]) => ({
    type,
    accepted,
    noticeVersion: CONSENT_NOTICE_VERSION,
    ip,
    userAgent,
  }));
}
