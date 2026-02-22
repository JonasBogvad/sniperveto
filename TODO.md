# SniperVeto - TODO

## In Progress
_None_

## Pending

### Must Have (MVP blockers)
- [x] Wire OAuth auth — Twitch live (NextAuth.js v5)
- [x] Wire OAuth auth — YouTube (Google provider)
- [ ] Wire OAuth auth — Kick (no official OAuth yet, skip)
- [x] Test all features in browser (reports load from DB, submit form, vote)
- [x] Rate limiting & abuse prevention (5 reports/hr, 50 votes/hr per user)

### Important (core product value)
- [x] Real mod verification via platform APIs (Twitch API — moderated channels + admin bypass)
- [x] Steam profile integration & validation (SteamID lookup, profile display, avatar)
- [x] Report appeals system

### Nice to Have
- [x] Browser extension — show SniperVeto data on Steam profile pages + quick-report button
- [x] CSV export functionality
- [x] Discord webhook notifications

## Completed
- [x] Migrate from Vite to Next.js
- [x] Set up Turbopack dev server
- [x] Configure Tailwind CSS v4
- [x] Create component structure
- [x] Set up path aliases (@/)
- [x] Mobile-first responsive design
- [x] Set up shadcn/ui component library
- [x] Refactor all components to shadcn/ui primitives
- [x] Full TypeScript migration (strict, no any)
- [x] Database integration (PostgreSQL/Prisma + Neon)
- [x] Backend API routes (GET/POST /api/reports, POST /api/reports/[id]/vote)
- [x] Migrate view-state routing → Next.js App Router file routes (/report, /stats)
- [x] Strict pre-commit hooks (tsc + eslint --max-warnings=0)
