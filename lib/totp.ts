import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { authenticator } from "otplib";

authenticator.options = { window: 1 };

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  return scryptSync(secret, "vada9598-totp", 32);
}

export function encryptTotpSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptTotpSecret(payload: string) {
  const [ivRaw, tagRaw, dataRaw] = payload.split(".");
  if (!ivRaw || !tagRaw || !dataRaw) throw new Error("Invalid TOTP secret");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  const plain = Buffer.concat([decipher.update(Buffer.from(dataRaw, "base64url")), decipher.final()]);
  return plain.toString("utf8");
}

export function createTotpSecret() {
  return authenticator.generateSecret();
}

export function totpUri(email: string, secret: string) {
  return authenticator.keyuri(email, "Vada 9598", secret);
}

export function verifyTotp(token: string, secret: string) {
  return authenticator.check(token.replace(/\s/g, ""), secret);
}
