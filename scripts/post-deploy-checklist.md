# Post-deploy checklist

1. `curl -fsS https://vada9598.online/api/health` returns `"ok": true`.
2. Sign in as Mayooran, complete two-factor setup, and change the seeded password.
3. Confirm Mugunthan and Ramanan can sign in and are blocked from `/admin/reports` and `/admin/admins`.
4. Submit a test membership on `/` and approve it. Confirm the identity number is `VADA-001` shape and the SES email arrived.
5. Amazon SES: domain `vada9598.online` is verified. DNS has the SES DKIM CNAMEs, an SPF record that includes `amazonses.com`, and a DMARC record (`v=DMARC1; p=quarantine`).
6. S3 bucket blocks public access. Profile photos open only through a signed URL.
7. Certbot timer is active: `systemctl status certbot.timer`.
8. Cron runs `scripts/backup-postgres.sh` and `POST /api/cron/daily-stats` with `CRON_SECRET`.
9. UFW allows only 22, 80 and 443. fail2ban is running.
10. A restored `pg_dump` from S3 opens in a scratch database.
