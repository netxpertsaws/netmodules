import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().optional(),
  titleEn: z.string().trim().min(2).max(160),
  titleTa: z.string().trim().min(2).max(160),
  descriptionEn: z.string().trim().min(2).max(4000),
  descriptionTa: z.string().trim().min(2).max(4000),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const obituarySchema = z.object({
  id: z.string().optional(),
  memberUserId: z.string().optional().or(z.literal("")),
  nameEn: z.string().trim().min(2).max(160),
  nameTa: z.string().trim().min(2).max(160),
  summaryEn: z.string().trim().min(2).max(4000),
  summaryTa: z.string().trim().min(2).max(4000),
  passedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const achievementSchema = z.object({
  id: z.string().optional(),
  memberUserId: z.string().optional().or(z.literal("")),
  titleEn: z.string().trim().min(2).max(160),
  titleTa: z.string().trim().min(2).max(160),
  bodyEn: z.string().trim().min(2).max(4000),
  bodyTa: z.string().trim().min(2).max(4000),
  year: z.coerce.number().int().min(1990).max(2100),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const memoriamSchema = z.object({
  id: z.string().optional(),
  nameEn: z.string().trim().min(2).max(160),
  nameTa: z.string().trim().min(2).max(160),
  tributeEn: z.string().trim().min(2).max(4000),
  tributeTa: z.string().trim().min(2).max(4000),
  years: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const albumSchema = z.object({
  id: z.string().optional(),
  titleEn: z.string().trim().min(2).max(160),
  titleTa: z.string().trim().min(2).max(160),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  coverKey: z.string().max(300).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const photoSchema = z.object({
  albumId: z.string().min(1),
  key: z.string().min(3).max(300),
  captionEn: z.string().trim().max(240).optional().or(z.literal("")),
  captionTa: z.string().trim().max(240).optional().or(z.literal("")),
});

export const condolenceSchema = z.object({
  obituaryId: z.string().min(1),
  message: z.string().trim().min(2).max(800),
});

export const wishSchema = z.object({
  toUserId: z.string().min(1),
  message: z.string().trim().min(2).max(500),
});

export const rejectSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().trim().min(4).max(500),
});

export const changeResolveSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["DONE", "REJECTED"]),
  adminNote: z.string().trim().max(500).optional().or(z.literal("")),
});
