<div align="center">
  <img src="public/logo.png" alt="SniperVeto" width="320" />

  <br />
  <br />

  **Community-driven stream sniper database for streamers and their mods.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://sniperveto.app)

  [**→ sniperveto.app**](https://sniperveto.app)
</div>

---

## The Problem

Stream snipers watch your stream to find out your in-game location and join your game to ruin it. They know where you are — you don't know who they are.

## The Solution

SniperVeto is a shared blocklist built by the streaming community. Streamers and their mods report suspected snipers by Steam ID with evidence. Other streamers corroborate with votes. Every report on the same Steam account stacks — building a cross-streamer, cross-game evidence file on known offenders.

---

## How It Works

1. **Report** — A streamer or verified mod submits a Steam ID, description, and proof links
2. **Corroborate** — Other verified streamers upvote reports they can confirm from their own experience
3. **Accumulate** — All reports across different streamers and games stack on the same Steam account
4. **Block** — The community uses the database to identify and block known snipers

---

## Features

- 🎮 **Public database** — Searchable by Steam ID, game, or streamer. No login required to browse
- ✅ **Verified reports** — Submissions require a verified Twitch or Kick account
- 🗳️ **Community voting** — Streamers upvote to corroborate reports they've experienced
- 📋 **Appeal system** — Reported players can verify their Steam identity and submit an appeal
- 🔔 **Discord notifications** — New reports and appeals notify your mod team instantly
- 🧩 **Browser extension** — Check any Steam profile against the database without leaving Steam

---

## Browser Extension

The [SniperVeto Extension](https://github.com/JonasBogvad/sniperveto-extension) injects a status panel directly into Steam Community profile pages — instantly showing whether a player is in the database, with a direct link to view reports or file a new one.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon) via Prisma v7 |
| Auth | NextAuth.js v5 — Twitch + Kick OAuth |
| Deployment | Vercel |

---

## License

MIT — see [LICENSE](LICENSE) for details.
