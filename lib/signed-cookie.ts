const encoder = new TextEncoder();

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bufferToHex(signature);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function signPayload(payload: string, secret: string) {
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifyPayload(token: string, secret: string) {
  const parts = token.split(".");
  const signature = parts.pop();
  if (!signature) return null;
  const payload = parts.join(".");
  const expected = await hmac(secret, payload);
  if (!safeEqual(signature, expected)) return null;
  return payload;
}

export const TOTP_COOKIE = "vada_admin_2fa";

export async function makeTotpCookie(userId: string, secret: string, ttlSeconds = 60 * 60 * 4) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return signPayload(`${userId}.${exp}`, secret);
}

export async function readTotpCookie(token: string | undefined, secret: string, userId: string) {
  if (!token || !secret) return false;
  const payload = await verifyPayload(token, secret);
  if (!payload) return false;
  const [id, expRaw] = payload.split(".");
  const exp = Number(expRaw);
  if (id !== userId || !Number.isFinite(exp)) return false;
  return exp > Math.floor(Date.now() / 1000);
}
