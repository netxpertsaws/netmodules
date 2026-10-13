type Bucket = number[];

const buckets = new Map<string, Bucket>();

export function isRateLimited(timestamps: number[], now: number, limit: number, windowMs: number) {
  const recent = timestamps.filter((stamp) => now - stamp < windowMs);
  return { limited: recent.length >= limit, recent };
}

/**
 * In-process limiter. Enough for a single EC2 app container; the user row
 * also tracks failed logins so a restart does not wipe account lockouts.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key) ?? [];
  const { limited, recent } = isRateLimited(current, now, limit, windowMs);
  if (!limited) recent.push(now);
  buckets.set(key, recent);
  return { ok: !limited, remaining: Math.max(0, limit - recent.length) };
}

export function resetRateLimits() {
  buckets.clear();
}
