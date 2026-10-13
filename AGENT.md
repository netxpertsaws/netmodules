# AGENT

## Checklist

- [x] Phase 1 — Project setup
- [x] Design system and 3D components
- [x] Prisma schema and seed
- [x] Auth.js, RBAC, TOTP, route tests
- [x] Public home, member form, consent
- [x] Admin approvals, identity numbers, member editor
- [x] Directory, profile, view logging
- [x] Member home, birthdays, events
- [x] Read-only profile and change requests
- [x] Obituaries, achievements, in memoriam, album, reports, audit, email
- [x] EC2 deploy scripts, nginx, GitHub Actions, backups

## Decisions

- The uploaded brief described the app and pointed at `BLUEPRINT.md`, but that file was not in the repo. `BLUEPRINT.md` in this commit is the working spec.
- The 13 schools are the main Vadamarachchi secondary schools that taught through A/L, in the order written in the blueprint. Stable ids are shared by the form and the seed.
- Consent notice version is `2026-01`. Directory and accuracy are required. Photo consent is required only when a photo is uploaded.
- Birth dates are calendar dates stored at UTC midnight. "Today" uses the `vada-tz` cookie, defaulting to `Asia/Colombo` until the browser sets it.
- Identity numbers come from `IdentityCounter` inside the approval or admin-create transaction. The counter only increments.
- Admin sessions last 4 hours and need a signed TOTP cookie. Member sessions last 8 hours. JWT updates cannot clear `mustChangePassword`; a password change signs the user in again.
- TOTP secrets are encrypted with AES-GCM using `AUTH_SECRET`.
- Without S3 or SES credentials the app stores media under `storage/` and logs email. Production should set both.
- A member `POST /api/profile` returns 403. Admins edit profiles only through server actions.
- Self profile views are logged. Prefetch requests and a second view inside 10 seconds are not.
- Deceased profiles stay visible, read-only, and out of birthday lists.
- This repository already contained a Terraform example. Those files were left in place.

## Session log

- Built the Next.js 15 application from the kickoff brief: public join flow, member area in English and Tamil, admin panel, phase 2 modules, and the EC2 deployment files.
- Verification: `npm run lint`, `npx tsc --noEmit`, `npm test`.

## Next step

Point `vada9598.online` at the EC2 host, fill production secrets, run `scripts/ec2-setup.sh`, obtain the certificate, and deploy with the GitHub Action.
