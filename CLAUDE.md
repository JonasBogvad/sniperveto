# CLAUDE.md — SniperVeto

> Read this file at the start of every session. It is the single source of truth for this project.

---

## 1. Product Vision

**SniperVeto** solves a real problem for live streamers: stream snipers join their games after watching where the streamer is located, giving them an unfair advantage.

**The solution**: a community-driven database where streamers and their mods can report suspected snipers by Steam ID. Other streamers can corroborate reports with votes, building trust-weighted evidence over time.

**Core user flows:**
1. Streamer or mod logs in via OAuth (Twitch / Kick / YouTube)
2. They submit a report: Steam ID + evidence links + description
3. Other verified streamers upvote to corroborate
4. The database becomes a shared blocklist for the streaming community

**Keep it simple.** This is not a general-purpose cheat database. It is specifically for *stream sniping* by *known accounts* with *evidence*.

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
| Auth | NextAuth.js (Twitch, Kick, YouTube) | Not yet built |
| Deployment | Vercel | Auto-deploy on push to `main` |

---

## 4. Project Structure

```
app/
  api/
    reports/
      route.ts              # GET (list) + POST (create)
      [id]/
        vote/
          route.ts          # POST (upsert vote)
  layout.tsx
  page.tsx                  # / — sniper database list (Client Component)
  report/
    page.tsx                # /report — submit a report (Client Component)
  stats/
    page.tsx                # /stats  — statistics (Server Component — fetches DB directly)
components/
  ui/                       # shadcn primitives (Button, Card, Dialog, etc.)
  Header.tsx
  LoginModal.tsx
  ReportCard.tsx
  ReportDetailModal.tsx
  ReportForm.tsx
  PlatformIcon.tsx
  SeverityBadge.tsx
  StatsView.tsx
data/
  mockData.ts               # Dev-only mock data (remove when auth is live)
lib/
  db.ts                     # Prisma singleton (import { db } from '@/lib/db')
  utils.ts                  # cn() utility
prisma/
  schema.prisma             # DB schema
prisma.config.ts            # Prisma connection config (reads from .env)
types/
  index.ts                  # All shared TypeScript types
```

---

## 5. Code Standards

### TypeScript
- Strict mode — **no `any`**, no `// @ts-ignore`
- All shared types live in `types/index.ts`
- Use `type` imports: `import type { Foo } from '@/types'`
- Use `interface` for component props, `type` for unions and aliases

### React / Next.js
- Use `'use client'` for components that use hooks or event handlers
- Import alias `@/` for all internal imports
- Mobile-first Tailwind: default styles for mobile, `sm:` for larger

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

## 6. Database

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

### Auth placeholder
Auth is not yet built. Until it is, API routes **upsert temporary User records** keyed on `{ platformId: username, platform }`. When real auth is wired, these records will be replaced by actual OAuth users.

---

## 7. Git & Quality Gates

Pre-commit hook runs **two checks** (both must pass):
1. `tsc --noEmit` — zero TypeScript errors across the whole project
2. `eslint --max-warnings=0` — zero ESLint warnings on staged files

**Never bypass with `--no-verify`.**

Branch strategy:
- `main` → production (Vercel auto-deploys)
- Feature branches → PR → merge to `main`

---

## 8. Quick Reference

```bash
npm run dev          # Start dev server (Turbopack, http://localhost:3000)
npm run build        # Production build
npm run type-check   # TypeScript check only
npm run lint         # ESLint check only
```
