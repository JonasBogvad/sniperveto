# CLAUDE.md — SniperVeto

> Read this file at the start of every session. It is the single source of truth for this project.

---

## 1. Product Vision

**SniperVeto** solves a real problem for live streamers: stream snipers join their games after watching where the streamer is located, giving them an unfair advantage.

**The solution**: a community-driven database where streamers and their mods can report suspected snipers by Steam ID. Other streamers can corroborate reports with votes, building trust-weighted evidence over time.

**Core user flows:**
1. Streamer or mod logs in via OAuth (Twitch / Kick)
2. They submit a report: Steam ID + evidence links + description
3. Other verified streamers upvote to corroborate
4. The database becomes a shared blocklist for the streaming community

**Keep it simple.** This is not a general-purpose cheat database. It is specifically for *stream sniping* by *known accounts* with *evidence*.

### The core data model — Steam account is the unit, not the streamer

Reports are anchored to a **Steam account**, not to a streamer or a game. This is fundamental:

- A sniper (`SteamAccount`) can have many `Report` records from many different streamers across many different games
- All those reports stack up on the same Steam ID — one entry in the database, multiple pieces of evidence
- Any streamer can vote to corroborate a report they didn't file, adding weight from their own experience
- `reportCount` on each report shows the total reports filed against that Steam ID across the entire community

**This means:** if `76561198XXXX` sniped streamer A in PUBG, streamer B in Rust, and streamer C in Tarkov, all three reports link to the same `SteamAccount`. The database builds a cross-streamer, cross-game evidence file on that person.

**Never break this by scoping reports to a single streamer or a single game.** The cross-community evidence accumulation is the product's core value.

---

## 2. Task Tracking

- **[TODO.md](./TODO.md)** — Always read this at the start of a session and keep it updated as work progresses.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Turbopack in dev |
| Language | **TypeScript** (strict) | All files `.ts` / `.tsx` — no `.js` / `.jsx` |
| Styling | Tailwind CSS v4 + shadcn/ui | Mobile-first |
| Database | Neon (PostgreSQL) via Vercel | |
| ORM | Prisma v7 | Schema: `prisma/schema.prisma` |
| DB client | `lib/db.ts` | Prisma singleton + Neon adapter |
| Auth | NextAuth.js v5 (next-auth@beta) | Twitch + Kick live (OAuth 2.1 + PKCE), YouTube removed |
| Deployment | Vercel | Auto-deploy on push to `main` |

---

## 4. Project Structure

```
app/
  api/
    auth/
      [...nextauth]/
        route.ts            # NextAuth handler
      steam/
        route.ts            # Steam OpenID redirect (appeal verification)
        callback/
          route.ts          # Steam OpenID callback → sets steam_appeal_token cookie
    admin/
      users/
        [id]/
          role/
            route.ts        # PATCH — set user role (ADMIN only), creates/deletes StreamerProfile
      streamers/
        [id]/
          mods/
            route.ts        # POST — add mod to a streamer (ADMIN only)
            [modId]/
              route.ts      # DELETE — remove mod from a streamer (ADMIN only)
    appeals/
      [id]/
        review/
          route.ts          # POST — accept/reject an appeal (MOD/STREAMER/ADMIN only)
    kick-token-proxy/
      route.ts              # POST — proxies Kick token exchange, injects client_id/secret into body
    my/
      mods/
        route.ts            # GET (list mods) + POST (add mod) — STREAMER only
        [modId]/
          route.ts          # DELETE — remove own mod (STREAMER only)
    reports/
      route.ts              # GET (list) + POST (create)
      [id]/
        appeal/
          route.ts          # POST — file appeal (requires steam_appeal_token cookie)
        vote/
          route.ts          # POST (upsert vote)
    users/
      search/
        route.ts            # GET — search users by username (MOD/STREAMER/ADMIN)
  about/
    page.tsx                # /about — static info page
  admin/
    page.tsx                # /admin — user/streamer management (ADMIN only, Server Component)
    AdminPanel.tsx          # Client Component — promote users, manage mods per streamer
  appeal/
    [id]/
      page.tsx              # /appeal/[id] — Server Component, reads DB + cookie
      AppealForm.tsx        # Client Component — Steam login or appeal form
  appeals/
    page.tsx                # /appeals — appeal management (MOD/STREAMER/ADMIN only)
    AppealsManager.tsx      # Client Component — accept/reject UI with status counts
  my/
    mods/
      page.tsx              # /my/mods — STREAMER's own mod management (Server Component)
      ModsManager.tsx       # Client Component — search users, add/remove mods
  privacy/
    page.tsx                # /privacy — Privacy Policy
  report/
    page.tsx                # /report — submit a report (Client Component)
  stats/
    page.tsx                # /stats  — statistics (Server Component — fetches DB directly)
  terms/
    page.tsx                # /terms — Terms of Service
  layout.tsx
  page.tsx                  # / — sniper database list (Client Component)
components/
  ui/                       # shadcn primitives (Button, Card, Dialog, etc.)
  Header.tsx                # Nav + auth — Appeals/My Mods/Admin links shown by role
  PlatformIcon.tsx          # SVG icons for Twitch / Kick (YouTube kept in component but unused)
  ReportCard.tsx
  ReportDetailModal.tsx     # Opens from DB list; links to /appeal/[id]
  ReportForm.tsx
  SessionProviderWrapper.tsx
  SeverityBadge.tsx
  StatsView.tsx
lib/
  db.ts                     # Prisma singleton (import { db } from '@/lib/db')
  discord.ts                # Discord webhook helpers (notifyDiscordNewReport, notifyDiscordNewAppeal)
  reports.ts                # fetchReports() — shared by API + stats page
  steam-appeal.ts           # HMAC-SHA256 signed token for Steam appeal verification
  user-context.tsx          # useUser() hook — thin wrapper over useSession()
  utils.ts                  # cn() utility
prisma/
  schema.prisma             # DB schema
prisma.config.ts            # Prisma connection config (reads from .env)
types/
  index.ts                  # All shared TypeScript types (Report, Appeal, AppUser, …)
```

### Appeal flow

1. Reported person visits `/appeal/[id]`
2. Clicks "Login with Steam" → redirected to Steam OpenID → callback sets `steam_appeal_token` cookie (15-min HMAC, verified identity)
3. Page confirms ownership; user fills reason + optional Discord username
4. POST `/api/reports/[id]/appeal` — enforces one appeal per report, notifies Discord webhook
5. Success screen tells them to join Discord to follow up
6. Mods/streamers visit `/appeals` to accept or reject

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled Neon connection |
| `DIRECT_URL` | Yes | Direct Neon connection (migrations) |
| `AUTH_SECRET` | Yes | NextAuth + appeal token signing |
| `AUTH_TWITCH_ID` / `AUTH_TWITCH_SECRET` | Yes | Twitch OAuth |
| `AUTH_KICK_ID` / `AUTH_KICK_SECRET` | Yes | Kick OAuth 2.1 |
| `AUTH_URL` | Yes | Full base URL (e.g. `http://localhost:3000`); used by Kick token proxy and NextAuth callback construction |
| `STEAM_API_KEY` | Yes | Steam OpenID verification |
| `DISCORD_WEBHOOK_URL` | Yes | Report + appeal notifications |
| `AUTH_ADMIN_USERNAMES` | Optional | Comma-separated platform usernames granted ADMIN role |
| `NEXT_PUBLIC_DISCORD_INVITE` | Optional | Discord invite link shown on appeal success screen |

---

## 5. Design System — Colors

All colors are defined as CSS tokens in `app/globals.css` and available as Tailwind utilities.

### Tokens

| Token | Value | Use |
|---|---|---|
| `bg-sv-page` | `#0f172a` | Page background (`<body>`) |
| `bg-sv-surface` | `#1e293b` | Cards, panels, forms |
| `bg-sv-elevated` | `#243347` | Modals, dropdowns |
| `text-sv-text` | `#f1f5f9` | Primary body text |
| `text-sv-text-2` | `#94a3b8` | Secondary text, labels, subtitles |
| `text-sv-text-3` | `#64748b` | Muted text, placeholders, footer |
| `bg-sv-brand` | `#dc2626` | Primary CTA buttons, logo |
| `bg-sv-brand-2` | `#ea580c` | Gradient end, hover state |
| `text-sv-clean` | `#22c55e` | Clean / no reports / success |
| `text-sv-warn` | `#f59e0b` | Pending / medium severity |
| `text-sv-danger` | `#dc2626` | Reported / high severity |

### Rules

- **Never use `purple-*`** — not part of the brand
- **Never use raw `gray-*`** — use `sv-text-2` or `sv-text-3` instead
- **Borders**: always `border-white/10` (Tailwind opacity modifier)
- **Subtle overlays**: `bg-white/5` or `bg-white/10` (fine to keep as-is)
- **Brand gradient**: always `from-sv-brand to-sv-brand-2`
- **Status colors** (`sv-clean`, `sv-warn`, `sv-danger`) are for semantic status only — not decorative

### Icons — PlatformIcon

`components/PlatformIcon.tsx` renders SVG icons for `twitch`, `kick` (and `youtube` — kept in code but not used in the UI).

- SVG paths are stored as constants in the `ICONS` object at the top of the file
- Source: [simpleicons.org](https://simpleicons.org) — search the platform name, copy the SVG path
- To update a logo: replace the path string in `ICONS`. No other files need to change.
- Colors are in the `COLORS` object (`text-purple-400`, `text-red-500`, `text-green-400`)
- Props: `platform: Platform | string`, `size?: number` (default 16)

---

## 6. Code Standards

### TypeScript
- Strict mode — **no `any`**, no `// @ts-ignore`
- All shared types live in `types/index.ts`
- Use `type` imports: `import type { Foo } from '@/types'`
- Use `interface` for component props, `type` for unions and aliases

### React / Next.js
- Use `'use client'` for components that use hooks or event handlers
- Import alias `@/` for all internal imports
- Mobile-first Tailwind: default styles for mobile, `sm:` for larger
- `<html>` always has `className="dark"` — required for shadcn dark mode and all color tokens

### Next.js App Router — routing rules

**Server vs Client components**
- Every component is a **Server Component by default** — do not add `'use client'` unless it actually needs it
- Needs `'use client'`: hooks (`useState`, `useEffect`, `useRouter`…), event handlers (`onClick`…), browser APIs
- Does NOT need `'use client'`: display-only components, async data fetching, components that only receive props
- Push `'use client'` as far down the tree as possible — keep pages and layouts as Server Components

**Data fetching**
- Fetch data in **Server Components** using `async/await` directly — no `useEffect` + `fetch` in pages
- Use `useEffect` + `fetch` only in Client Components that truly need client-side data (e.g. polling, user-triggered refreshes)
- Pass fetched data down as props to Client Components

**File conventions** (all in `app/`)

| File | Purpose |
|---|---|
| `page.tsx` | The UI for a route — makes the route publicly accessible |
| `layout.tsx` | Shared shell wrapping child routes (persists across navigation) |
| `loading.tsx` | Automatic Suspense fallback shown while the page loads |
| `error.tsx` | Error boundary for the route — must be `'use client'` |
| `not-found.tsx` | Shown when `notFound()` is called |
| `route.ts` | API endpoint — export named HTTP handlers (`GET`, `POST`, etc.) |

**Route organisation**
- Dynamic segments: `app/reports/[id]/page.tsx` → `/reports/abc123`
- Route groups `(name)` — group routes without affecting the URL: `app/(dashboard)/reports/page.tsx` → `/reports`
- Parallel routes and intercepting routes are advanced — don't use unless the feature clearly requires them

**Navigation**
- Links: `import Link from 'next/link'` → `<Link href="/report">…</Link>`
- Programmatic: `import { useRouter } from 'next/navigation'` (App Router) — **never** `next/router` (Pages Router)
- Read current path: `usePathname()` from `next/navigation`
- Read/update query params: `useSearchParams()` from `next/navigation`
- Server-side redirect: `import { redirect } from 'next/navigation'` → `redirect('/login')`
- 404: `import { notFound } from 'next/navigation'` → `notFound()`

**Metadata**
- Static: `export const metadata: Metadata = { title: '…' }` in `page.tsx` or `layout.tsx`
- Dynamic: `export async function generateMetadata({ params }) { … }` when title depends on data

**No `currentView` state routing**
- Never simulate routing with a state variable — give each view its own URL

### UI components (shadcn/ui)
- **Always use shadcn components** from `components/ui/` — never raw HTML equivalents
- `<Button>` not `<button>`, `<Input>` not `<input>`, `<Dialog>` not `<dialog>`, `<Select>` not `<select>`
- Extend shadcn components with Tailwind classes via `className` — never override their internal styles directly
- New shadcn components go in `components/ui/` — run `npx shadcn add <component>` to install them
- Domain components (e.g. `ReportCard`, `SeverityBadge`) compose shadcn primitives — they do not use raw HTML form/interactive elements

### API routes
- All in `app/api/`
- Return `NextResponse.json()` with appropriate status codes
- Validate input; return `400` for bad requests, `500` for server errors
- All DB access via `import { db } from '@/lib/db'`
- Platform strings: frontend uses lowercase (`twitch`), DB enum is uppercase (`TWITCH`) — convert at the API boundary

### Component conventions
- One component per file, default export
- Props interface named `<ComponentName>Props`
- No inline business logic — keep components display-focused

### No new files without a plan
Creating a new file requires: knowing where it fits in the structure above, and updating `README.md` if it introduces a new pattern.

---

## 7. Auth & Roles

### Who logs in
| User | Logs in? | Why |
|---|---|---|
| **Mod** | Yes — required | Must prove they moderate the channel they're reporting on behalf of |
| **Streamer** | Optional | Can log in to manage their own reports, but many won't — **never require it** |
| **Viewer / public** | Never | Read-only access to the database |

**Key principle: streamers are privacy-sensitive accounts.** Many will never log in — they guard their platform credentials and don't want to authorise third-party apps. A streamer should never be required to log in for a report to be filed about snipers in their channel. Their mods handle this.

### How a mod is verified

**Twitch (automatic):** On login we call `GET /helix/moderation/channels` to get all channels the user moderates. `StreamerMod` records are created automatically for each. Role is set to `MOD` if any mod channels found.

**Kick (manual only):** Kick has no equivalent API endpoint for mod lookups. Kick mods must be manually assigned by an ADMIN or by the STREAMER themselves via `/my/mods`.

**Manual assignment:** Streamers visit `/my/mods` to search and add any user as their mod. Admins can also manage mods via `/admin`.

All reports a mod submits are tagged with both `reportedBy` (the streamer) and `submittedBy` (the mod).

### Streamer referenced without account
A streamer can appear as `reportedBy` on reports **without having an account**. Their platform username is stored as a lightweight `User` record (no OAuth token, `verified: false`). If they ever choose to log in, the record is upgraded to a verified account. Never block report submission because the streamer hasn't logged in.

### Role capabilities
| Action | Public | Streamer (logged in) | Mod (verified) |
|---|---|---|---|
| Browse reports | ✅ | ✅ | ✅ |
| Submit report | ❌ | ✅ | ✅ (on behalf of their streamer) |
| Vote / corroborate | ❌ | ✅ | ✅ |
| Delete own report | ❌ | ✅ | ✅ |
| Admin actions | ❌ | ❌ | ❌ (`ADMIN` role only) |

### Data visibility — keep it simple
SniperVeto is a **public database by design**. Reports are meant to be seen by everyone — that is the product. Do not add row-level read restrictions or per-user data isolation. There is no private data between users.

**What is public (no auth required):**
- All reports and their details
- Vote counts
- Submitter attribution (streamer name, mod name) — trust depends on knowing who filed what

**What requires auth (write guards only):**
| Action | Guard |
|---|---|
| Submit a report | Session user must be `MOD` or `STREAMER` role |
| `reportedBy` field | Must be the session user's own channel, or a channel they have a `StreamerMod` record for |
| Vote | One per user per report — enforced by DB `@@unique([reportId, userId])` |
| Delete a report | Only the original submitter or the streamer the report is about |

**The critical check — cross-channel impersonation:**
When a mod submits a report, verify `reportedBy` matches a channel linked in `StreamerMod`. A mod of Stream X must not be able to file reports on behalf of Stream Y.

Do not over-engineer this. There are no private messages, no sensitive personal data, no need for complex ACLs. The threat model is write abuse, not read leakage.

### Role priority on sign-in
`ADMIN` (env list) > `STREAMER` (has `StreamerProfile` in DB) > `MOD` (Twitch mod API returned channels) > `USER`

### OAuth providers
- **Twitch** — primary. Mod detection via Twitch API (`/helix/moderation/channels`). Avatar from `static-cdn.jtvnw.net`.
- **Kick** — live via OAuth 2.1 (PKCE required). Token exchange uses a server-side proxy (`/api/kick-token-proxy`) because oauth4webapi sends credentials as HTTP Basic Auth but Kick requires them in the POST body. No mod auto-detection — mods must be assigned manually. Kick CDN blocks avatar hotlinking; show `PlatformIcon` instead.
- **YouTube** — removed. Not streamer-focused enough; adds complexity without benefit.

---

## 8. Database

```bash
vercel env pull .env.development.local   # Sync env vars from Vercel (never commit .env)
npx prisma migrate dev --name <name>     # Create + apply migration
npx prisma generate                      # Regenerate Prisma client after schema change
npx prisma studio                        # Browse DB in browser
```

- Connection strings live only in `.env.development.local` (gitignored)
- `DATABASE_URL` = pooled connection (Prisma runtime)
- `DIRECT_URL` = direct connection (migrations)
- All DB access: `import { db } from '@/lib/db'`
- **After schema changes**: always `rm -rf .next && npx prisma generate && npm run dev` — Turbopack dev cache holds the old Prisma client and will silently use it

### Auth
- Config lives in `auth.ts` at the root
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- `types/next-auth.d.ts` — session type augmentation
- On sign-in: upserts a real `User` record in the DB (`verified: true`)
- Session user shape: `{ id, name, username, platform, role, image }`
- `platform` is **lowercase** in the session (`twitch`) to match `PlatformIcon`
- Always run `prisma generate && next build` — the build script handles this automatically

---

## 9. Git & Quality Gates

Pre-commit hook runs **two checks** (both must pass):
1. `tsc --noEmit` — zero TypeScript errors across the whole project
2. `eslint --max-warnings=0` — zero ESLint warnings on staged files

**Never bypass with `--no-verify`.**

Branch strategy:
- `main` → production (Vercel auto-deploys)
- Feature branches → PR → merge to `main`

---

## 10. Browser Extension

Separate repo: **`github.com/JonasBogvad/sniperveto-extension`** (local: `C:\Github\sniperveto-extension`)

- Built with WXT + TypeScript, targets Chrome/Edge (MV3)
- Injects a status panel on `steamcommunity.com` profile pages
- Checks `GET /api/reports?steamId=` — added to this API for the extension
- Report button opens `/report?steamId=&steamName=` with fields pre-filled
- Dev: `npm run dev` in the extension repo (runs on port 3010, opens Edge)

---

## 11. Quick Reference

```bash
npm run dev          # Start dev server (Turbopack, http://localhost:3000)
npm run build        # Production build
npm run type-check   # TypeScript check only
npm run lint         # ESLint check only
```
