# SniperVeto - TODO

## In Progress
_None_

## Pending

### Nice to Have
- [ ] Kick mod auto-detection (no API available yet — manual assignment only for now)
- [ ] Discord bot (`/sniperveto <steamid>`)

## Completed

### Auth & Roles
- [x] Wire OAuth auth — Twitch (NextAuth.js v5, mod auto-detection via Twitch API)
- [x] Wire OAuth auth — Kick (OAuth 2.1 + PKCE, token proxy for credential injection)
- [-] Wire OAuth auth — YouTube (removed — not streamer-focused)
- [x] Role system — ADMIN / STREAMER / MOD / USER with priority order
- [x] Admin panel (`/admin`) — promote users to streamer, manage mods
- [x] Streamer mod management (`/my/mods`) — streamers assign their own mods

### Core Features
- [x] Database integration (PostgreSQL/Prisma + Neon)
- [x] Backend API routes (GET/POST /api/reports, POST /api/reports/[id]/vote)
- [x] Rate limiting & abuse prevention (5 reports/hr, 50 votes/hr per user)
- [x] Real mod verification via Twitch API (moderated channels)
- [x] Steam profile integration & validation (SteamID lookup, profile display, avatar)
- [x] Report appeals system with Steam identity verification
- [x] CSV export functionality
- [x] Discord webhook notifications (reports + appeals)
- [x] Statistics dashboard (`/stats`)

### Browser Extension
- [x] Steam profile panel — shows clean/reported status with report count
- [x] Quick-report button pre-filled with Steam ID
- [x] Extension icons (16/48/128px)
- [x] Published to Chrome Web Store

### Infrastructure
- [x] Migrate from Vite to Next.js 16 (App Router, Turbopack)
- [x] Full TypeScript migration (strict, no any)
- [x] Tailwind CSS v4 + shadcn/ui component library
- [x] Mobile-first responsive design
- [x] Strict pre-commit hooks (tsc + eslint --max-warnings=0)
- [x] Custom domain — sniperveto.app
- [x] Vercel Analytics
- [x] MIT License
