#!/usr/bin/env bash
# First-boot setup for Ubuntu 24.04 on the vada9598.online EC2 host.
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl git ufw fail2ban docker.io docker-compose-v2

if ! id deploy >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash deploy
fi
usermod -aG docker deploy
install -d -o deploy -g deploy /opt/vada9598 /var/www/certbot

ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable --now docker fail2ban

echo "Next: clone the repo into /opt/vada9598 as the deploy user, add .env, then run certbot."
echo "  certbot certonly --webroot -w /var/www/certbot -d vada9598.online -d www.vada9598.online"
echo "Install a crontab for the deploy user:"
echo "  15 2 * * * curl -fsS -X POST -H \"Authorization: Bearer \$CRON_SECRET\" http://127.0.0.1/api/cron/daily-stats"
echo "  30 2 * * * /opt/vada9598/scripts/backup-postgres.sh"
