/**
 * Per-field visibility. Hidden fields are removed before a profile leaves
 * the data layer, so member API responses and pages never receive them.
 */

export const VISIBILITY = ["MEMBERS", "ADMINS_ONLY"] as const;
export type FieldVisibility = (typeof VISIBILITY)[number];

export const SENSITIVE_FIELDS = [
  "mobile",
  "whatsapp",
  "address",
  "spouseName",
  "children",
  "admissionNo",
  "email",
  "employer",
] as const;

export type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

export const DEFAULT_VISIBILITY: Record<SensitiveField, FieldVisibility> = {
  mobile: "ADMINS_ONLY",
  whatsapp: "ADMINS_ONLY",
  address: "ADMINS_ONLY",
  spouseName: "ADMINS_ONLY",
  children: "ADMINS_ONLY",
  admissionNo: "ADMINS_ONLY",
  email: "ADMINS_ONLY",
  employer: "ADMINS_ONLY",
};

export type ViewerRole = "MEMBER" | "ADMIN" | "SUPER_ADMIN";

export type ProfileSource = {
  fullName: string;
  fullNameTa: string | null;
  nickname: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  schoolId: string | null;
  schoolNameEn: string | null;
  schoolNameTa: string | null;
  alStream: string | null;
  admissionNo: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  mobile: string | null;
  whatsapp: string | null;
  email: string | null;
  profession: string | null;
  employer: string | null;
  jobTitle: string | null;
  maritalStatus: string | null;
  spouseName: string | null;
  children: string | null;
  about: string | null;
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  website: string | null;
  photoKey: string | null;
  photoConsent: boolean;
  birthdayConsent: boolean;
  contactConsent: boolean;
  visibility: Partial<Record<SensitiveField, FieldVisibility>> | null;
  status: string;
  identityNo: string | null;
  deceasedAt: Date | null;
};

export type ViewerProfile = {
  identityNo: string | null;
  fullName: string;
  fullNameTa: string | null;
  nickname: string | null;
  gender: string | null;
  schoolId: string | null;
  schoolNameEn: string | null;
  schoolNameTa: string | null;
  alStream: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  jobTitle: string | null;
  maritalStatus: string | null;
  about: string | null;
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  website: string | null;
  photoKey: string | null;
  status: string;
  deceasedAt: string | null;
  birthday: { month: number; day: number } | null;
  dateOfBirth: string | null;
  mobile: string | null;
  whatsapp: string | null;
  address: string | null;
  spouseName: string | null;
  children: string | null;
  admissionNo: string | null;
  email: string | null;
  employer: string | null;
};

function isAdmin(role: ViewerRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function visibilityFor(source: ProfileSource, field: SensitiveField): FieldVisibility {
  return source.visibility?.[field] ?? DEFAULT_VISIBILITY[field];
}

function reveal(source: ProfileSource, field: SensitiveField, role: ViewerRole) {
  if (isAdmin(role)) return true;
  if (field === "mobile" || field === "whatsapp" || field === "email") {
    if (!source.contactConsent) return false;
  }
  return visibilityFor(source, field) === "MEMBERS";
}

function isoDate(value: Date | null) {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

/** Strip anything the viewer is not allowed to see. Admins receive the full record. */
export function toViewerProfile(source: ProfileSource, role: ViewerRole): ViewerProfile {
  const admin = isAdmin(role);
  const birthday =
    source.dateOfBirth && (admin || source.birthdayConsent)
      ? {
          month: source.dateOfBirth.getUTCMonth() + 1,
          day: source.dateOfBirth.getUTCDate(),
        }
      : null;

  return {
    identityNo: source.identityNo,
    fullName: source.fullName,
    fullNameTa: source.fullNameTa,
    nickname: source.nickname,
    gender: source.gender,
    schoolId: source.schoolId,
    schoolNameEn: source.schoolNameEn,
    schoolNameTa: source.schoolNameTa,
    alStream: source.alStream,
    city: source.city,
    country: source.country,
    profession: source.profession,
    jobTitle: source.jobTitle,
    maritalStatus: source.maritalStatus,
    about: source.about,
    facebook: source.facebook,
    linkedin: source.linkedin,
    instagram: source.instagram,
    website: source.website,
    photoKey: source.photoConsent || admin ? source.photoKey : null,
    status: source.status,
    deceasedAt: source.deceasedAt ? source.deceasedAt.toISOString() : null,
    birthday,
    dateOfBirth: admin ? isoDate(source.dateOfBirth) : null,
    mobile: reveal(source, "mobile", role) ? source.mobile : null,
    whatsapp: reveal(source, "whatsapp", role) ? source.whatsapp : null,
    address: reveal(source, "address", role) ? source.address : null,
    spouseName: reveal(source, "spouseName", role) ? source.spouseName : null,
    children: reveal(source, "children", role) ? source.children : null,
    admissionNo: reveal(source, "admissionNo", role) ? source.admissionNo : null,
    email: reveal(source, "email", role) ? source.email : null,
    employer: reveal(source, "employer", role) ? source.employer : null,
  };
}

/** MEMBER writes to MemberProfile are rejected. Admins may write. */
export function profileWriteStatus(role: string | null | undefined): 200 | 401 | 403 {
  if (!role) return 401;
  if (role === "ADMIN" || role === "SUPER_ADMIN") return 200;
  return 403;
}
