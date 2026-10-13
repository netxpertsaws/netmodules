export {};

/**
 * Manual equivalent of the nightly job. Production cron should call
 * POST /api/cron/daily-stats with Authorization: Bearer $CRON_SECRET.
 */
const base = process.env.APP_URL ?? "http://localhost:3000";
const secret = process.env.CRON_SECRET;
if (!secret) {
  throw new Error("CRON_SECRET is required");
}

const response = await fetch(`${base}/api/cron/daily-stats`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
});
const body = await response.text();
if (!response.ok) {
  console.error(body);
  process.exit(1);
}
console.log(body);
