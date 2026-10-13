# Vada 9598 blueprint

Private bilingual network for the Vadamarachchi O/L 1995 and A/L 1998 old students of 13 schools. Domain: `vada9598.online`.

The kickoff brief referred to a blueprint file that was not in the repository. This document is the working spec the application implements. Product choices that were not spelled out in the brief are listed in `AGENT.md`.

## 1. Roles

- `MEMBER` — approved old student. Read-only profile. Can change password and language, send change requests, wishes and condolences.
- `ADMIN` — Mugunthan and Ramanan, plus anyone a super admin promotes. Must use TOTP.
- `SUPER_ADMIN` — Mayooran. Reports and admin role changes.

## 2. Joining

Members join only through the form on `/`. There is no Google Form and no CSV import. Submit creates `PENDING` rows in PostgreSQL. Approval assigns `VADA-001` inside a transaction. Numbers are never reused.

Admin-created members receive an invite, stay `PENDING`, and stay out of the directory until they set a password and store consent.

## 3.1 Public home

Navy and gold hero (React Three Fiber when motion and WebGL allow it, static glass otherwise). The join button scrolls to a glass step wizard: Account, Identity, School, Personal, Location, Contact, Work, Family, Consent, Review. Progress is kept in `localStorage` except the password. Honeypot, rate limit and Cloudflare Turnstile protect the submit. Photos are resized to private WebP and served later with signed URLs.

Consent notice `2026-01`:

1. Directory listing (required).
2. Photograph (required when a photo is uploaded).
3. Birthday day and month (optional).
4. Contact fields marked visible to all members (optional).
5. Accuracy declaration for the O/L 1995 or A/L 1998 Vadamarachchi batch (required).

Each consent row stores type, notice version, timestamp and IP.

## 3.3 Member home

`/[locale]/home` shows today's birthdays in the viewer's time zone, the next 7 days, and published events. 29 February is shown on 28 February in non-leap years. Deceased members and members without birthday consent are excluded. Placeholder links open obituaries, achievements, in memoriam and the album.

## 3.4 Phase 2 modules

- Obituaries and condolences, and In memoriam, use the calm memorial panel. No 3D, tilt or confetti.
- Hall of achievement.
- Photo albums.
- Super admin reports: status counts, daily view heat map, most-viewed profiles, CSV and PDF.
- Audit log of every admin change.
- Email through Amazon SES when configured, otherwise logged on the server.

## 3.5 Reports

`DailyViewStats` is filled by `POST /api/cron/daily-stats`. A profile view writes one `VIEW_PROFILE` activity row. Router prefetches are ignored, and a repeat from the same viewer within 10 seconds is ignored.

## 3.9 Design

Navy `#0B1530` → `#13244D`, gold `#D4A84B`, teal `#2EC4B6`. Dark by default, light optional. Glass cards, 20px radius, 44px targets, bottom nav on phones. Inter and Noto Sans Tamil. Memorial pages use a serif heading and muted tones.

## 6. Data

Prisma models: School, User, IdentityCounter, MemberProfile, Consent, ChangeRequest, Event, Obituary, Condolence, Achievement, Memoriam, Album, Photo, BirthdayWish, ActivityLog, AuditLog, DailyViewStats, plus Auth.js Account, Session and VerificationToken.

Sensitive fields default to admins only: mobile, WhatsApp, address, spouse, children, admission number, email, employer. The data layer strips them before a member response. Members never receive the birth year; admins do.

The 13 schools, in order: Hartley College; Methodist Girls' High School; Vadamaradchy Hindu Girls' College; Velautham Maha Vidyalayam; Udupiddy American Mission College; Udupiddy Girls' College; Nelliady Madhya Maha Vidyalayam; Vadamaradchy Central Ladies' College; Vathiry Sacred Heart College; Gnanasariyar College; Thevarayali Hindu College; Vikneswara College; Thondaimanaru Veerakaththipillai Maha Vidyalayam.
