# SniperVeto

Community-driven stream sniper reporting database for streamers and moderators.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

- **Public Database** - Browse reported stream snipers by game, streamer, and Steam ID
- **Streamer & Mod Login** - Authenticate via Twitch, YouTube, or Kick
- **Weighted Voting** - Verified streamers/mods get 2x vote weight
- **Report Submission** - Submit reports with Steam IDs, descriptions, and proof links
- **Mobile-First Design** - Responsive interface optimized for all devices
- **Statistics Dashboard** - Aggregate data on reports by game and severity

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.1.0 | React framework with Turbopack |
| react | ^19.0.0 | UI library |
| react-dom | ^19.0.0 | React DOM renderer |
| tailwindcss | ^4.0.0 | Utility-first CSS |

## Commands

```bash
npm install     # Install dependencies
npm run dev     # Start dev server with Turbopack (localhost:3000)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Project Structure

```
sniperveto/
├── app/                    # Next.js App Router
│   ├── layout.jsx         # Root layout
│   ├── page.jsx           # Home page
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── Header.jsx
│   ├── LoginModal.jsx
│   ├── PlatformIcon.jsx
│   ├── ReportCard.jsx
│   ├── ReportDetailModal.jsx
│   ├── ReportForm.jsx
│   ├── SeverityBadge.jsx
│   └── StatsView.jsx
│
├── data/                  # Data layer
│   └── mockData.js        # Mock data (future: API)
│
├── public/                # Static assets
│   └── favicon.svg
│
├── next.config.js         # Next.js configuration
├── jsconfig.json          # Path aliases (@/)
├── postcss.config.mjs     # PostCSS/Tailwind config
├── package.json
├── CLAUDE.md              # AI assistant instructions
├── TODO.md                # Task list
└── README.md              # This file
```

## Code Standards

### Imports
- Use `@/` path alias for imports
- Use named imports: `import { useState } from 'react'`
- Group imports: react → next → components → data

### Components
- Add `'use client'` directive for client components (with hooks/interactivity)
- One component per file
- Functional components with hooks
- Mobile-first responsive design (sm: → md: → lg:)

### Styling
- Tailwind CSS v4
- Mobile breakpoints: default → sm:640px → md:768px → lg:1024px

## Data Layer

### Current State
Mock data in `data/mockData.js`. Ready for API integration.

### Data Structures

```javascript
// Report
{
  id: number,
  steamId: string,
  steamName: string,
  reportedBy: string,
  submittedBy: string | null,
  platform: 'twitch' | 'youtube' | 'kick',
  game: string,
  date: string,
  description: string,
  proofLinks: string[],
  reportCount: number,
  severity: 'low' | 'medium' | 'high',
  votes: { total: number, voters: string[] }
}
```

## License

MIT
