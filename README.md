# Vada 9598

Private bilingual (English and Tamil) network for the Vadamarachchi O/L 1995 / A/L 1998 old students. The product spec is [BLUEPRINT.md](BLUEPRINT.md). Progress notes are in [AGENT.md](AGENT.md).

## Local development

```bash
cp .env.example .env
# set AUTH_SECRET and the three seed passwords
docker compose up -d postgres
npx prisma migrate deploy
npm run db:seed
npm run dev
```

`TURNSTILE_BYPASS=true` lets the join form submit without Cloudflare while `NODE_ENV` is not production.

The public home is `/`. After approval, members use `/en/home` or `/ta/home`. Admins use `/admin` and must turn on two-factor authentication.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Schools and the three staff accounts |
| `npm test` | Unit tests |

## Production

Ubuntu 24.04 setup is `scripts/ec2-setup.sh`. TLS nginx config is `nginx.conf`. Images are built by `.github/workflows/deploy.yml` and started with `docker-compose.prod.yml`. Nightly backups are `scripts/backup-postgres.sh`. The checklist is `scripts/post-deploy-checklist.md`.

A Terraform example from the original repository is still in the root. It is not used by this application.
