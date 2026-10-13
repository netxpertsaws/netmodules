#!/usr/bin/env bash
# Nightly logical backup to S3, kept 30 days.
set -euo pipefail

: "${DATABASE_URL:?}"
: "${AWS_S3_BUCKET:?}"
: "${AWS_REGION:?}"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="/tmp/vada9598-${STAMP}.sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$FILE"
aws s3 cp "$FILE" "s3://${AWS_S3_BUCKET}/backups/vada9598-${STAMP}.sql.gz" --region "$AWS_REGION"
rm -f "$FILE"

CUTOFF="$(date -u -d '30 days ago' +%Y-%m-%d 2>/dev/null || date -u -v-30d +%Y-%m-%d)"
aws s3 ls "s3://${AWS_S3_BUCKET}/backups/" --region "$AWS_REGION" | while read -r line; do
  day="$(echo "$line" | awk '{print $1}')"
  name="$(echo "$line" | awk '{print $4}')"
  if [[ -n "$name" && "$day" < "$CUTOFF" ]]; then
    aws s3 rm "s3://${AWS_S3_BUCKET}/backups/${name}" --region "$AWS_REGION"
  fi
done
