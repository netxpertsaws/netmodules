import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

const MAX_BYTES = 5 * 1024 * 1024;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is required");
  return value;
}

function localRoot() {
  return path.join(process.cwd(), "storage");
}

export function storageMode() {
  return process.env.AWS_S3_BUCKET ? "s3" : "local";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function s3() {
  return new S3Client({ region: process.env.AWS_REGION });
}

export function sniffImage(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg" as const;
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") return "image/png" as const;
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp" as const;
  }
  return null;
}

export async function createUploadTarget(contentType: string, contentLength: number) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error("Only JPEG, PNG and WebP images are accepted");
  }
  if (contentLength < 1 || contentLength > MAX_BYTES) {
    throw new Error("Images must be 5 MB or smaller");
  }
  const key = `incoming/${randomUUID()}`;
  const exp = Date.now() + 10 * 60 * 1000;
  if (storageMode() === "s3") {
    const url = await getSignedUrl(
      s3(),
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
      }),
      { expiresIn: 600 },
    );
    return { key, uploadUrl: url, method: "PUT" as const, headers: { "Content-Type": contentType } };
  }
  const signature = sign(`${key}.${exp}`);
  const uploadUrl = `/api/upload/local?key=${encodeURIComponent(key)}&exp=${exp}&sig=${signature}`;
  return { key, uploadUrl, method: "PUT" as const, headers: { "Content-Type": contentType } };
}

export function localUploadAllowed(key: string, exp: string, sig: string) {
  if (!/^incoming\/[0-9a-f-]{36}$/.test(key)) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqualHex(sig, sign(`${key}.${exp}`));
}

export async function writeLocalObject(key: string, body: Buffer) {
  if (key.includes("..")) throw new Error("Invalid key");
  const file = path.join(localRoot(), key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
}

async function readObject(key: string) {
  if (storageMode() === "s3") {
    const response = await s3().send(new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) throw new Error("Empty upload");
    return Buffer.from(bytes);
  }
  return readFile(path.join(localRoot(), key));
}

async function writeObject(key: string, body: Buffer, contentType: string) {
  if (storageMode() === "s3") {
    await s3().send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return;
  }
  await writeLocalObject(key, body);
}

export async function processUpload(key: string) {
  if (!/^incoming\/[0-9a-f-]{36}$/.test(key)) throw new Error("Unknown upload");
  const original = await readObject(key);
  if (original.length > MAX_BYTES) throw new Error("Images must be 5 MB or smaller");
  if (!sniffImage(original)) throw new Error("Only JPEG, PNG and WebP images are accepted");
  const id = randomUUID();
  const fullKey = `photos/${id}/full.webp`;
  const thumbKey = `photos/${id}/thumb.webp`;
  const full = await sharp(original).rotate().resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const thumb = await sharp(original).rotate().resize(400, 400, { fit: "cover" }).webp({ quality: 78 }).toBuffer();
  await writeObject(fullKey, full, "image/webp");
  await writeObject(thumbKey, thumb, "image/webp");
  if (storageMode() === "local") {
    await rm(path.join(localRoot(), key), { force: true });
  }
  return { photoKey: fullKey, thumbKey };
}

export async function signedPhotoUrl(key: string | null | undefined, ttlSeconds = 300) {
  if (!key) return null;
  if (!/^photos\/[0-9a-f-]{36}\/(full|thumb)\.webp$/.test(key)) return null;
  if (storageMode() === "s3") {
    return getSignedUrl(s3(), new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }), { expiresIn: ttlSeconds });
  }
  const exp = Date.now() + ttlSeconds * 1000;
  const sig = sign(`${key}.${exp}`);
  return `/api/media?key=${encodeURIComponent(key)}&exp=${exp}&sig=${sig}`;
}

export function mediaSignatureValid(key: string, exp: string, sig: string) {
  if (!/^photos\/[0-9a-f-]{36}\/(full|thumb)\.webp$/.test(key)) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqualHex(sig, sign(`${key}.${exp}`));
}

export async function readPhoto(key: string) {
  return readObject(key);
}

export function thumbKeyFor(photoKey: string) {
  return photoKey.replace(/full\.webp$/, "thumb.webp");
}
