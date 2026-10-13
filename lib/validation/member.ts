import { z } from "zod";
import { SCHOOL_IDS } from "@/lib/schools";
import { SENSITIVE_FIELDS, VISIBILITY } from "@/lib/visibility";

export const CONSENT_NOTICE_VERSION = "2026-01";

export const passwordSchema = z
  .string()
  .min(10, "At least 10 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number");

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const visibilitySchema = z.object({
  mobile: z.enum(VISIBILITY),
  whatsapp: z.enum(VISIBILITY),
  address: z.enum(VISIBILITY),
  spouseName: z.enum(VISIBILITY),
  children: z.enum(VISIBILITY),
  admissionNo: z.enum(VISIBILITY),
  email: z.enum(VISIBILITY),
  employer: z.enum(VISIBILITY),
});

export const memberFieldsSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  fullNameTa: optionalText(120),
  nickname: optionalText(80),
  gender: z.enum(["female", "male", "undisclosed"]),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const year = Number(value.slice(0, 4));
      return year >= 1965 && year <= 1990;
    }, "Enter a date of birth between 1965 and 1990"),
  schoolId: z.string().refine((id) => SCHOOL_IDS.has(id), "Choose a school"),
  alStream: z.enum(["MATHS", "BIO", "COMMERCE", "ARTS", "TECHNOLOGY", "OTHER"]),
  admissionNo: optionalText(40),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  address: optionalText(240),
  mobile: z.string().trim().min(8).max(20),
  whatsapp: optionalText(20),
  profession: z.string().trim().min(2).max(80),
  employer: optionalText(120),
  jobTitle: optionalText(120),
  maritalStatus: z.enum(["single", "married", "other", "undisclosed"]),
  spouseName: optionalText(120),
  children: optionalText(240),
  about: optionalText(2000),
  facebook: optionalText(200),
  linkedin: optionalText(200),
  instagram: optionalText(200),
  website: optionalText(200),
  photoKey: optionalText(300),
  visibility: visibilitySchema,
});

export const consentSchema = z.object({
  directory: z.literal(true),
  photo: z.boolean(),
  birthday: z.boolean(),
  contact: z.boolean(),
  accuracy: z.literal(true),
  noticeVersion: z.literal(CONSENT_NOTICE_VERSION),
});

export const joinSchema = memberFieldsSchema
  .extend({
    email: z.string().trim().email().max(160),
    password: passwordSchema,
    confirmPassword: z.string(),
    company: z.string().max(0).optional().or(z.literal("")),
    turnstileToken: z.string().optional(),
    consents: consentSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .superRefine((value, ctx) => {
    if (value.photoKey && !value.consents.photo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consents", "photo"],
        message: "Photo consent is required when a photo is uploaded",
      });
    }
  });

export const adminMemberSchema = memberFieldsSchema.extend({
  email: z.string().trim().email().max(160),
  password: z.union([passwordSchema, z.literal("")]).optional(),
  userId: z.string().optional(),
});

export const changeRequestSchema = z.object({
  message: z.string().trim().min(8).max(2000),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const inviteAcceptSchema = z
  .object({
    token: z.string().min(20),
    password: passwordSchema,
    confirmPassword: z.string(),
    consents: consentSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type JoinInput = z.infer<typeof joinSchema>;
export type MemberFields = z.infer<typeof memberFieldsSchema>;

export const SENSITIVE_FIELD_LIST = SENSITIVE_FIELDS;
