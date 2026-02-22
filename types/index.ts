// ─────────────────────────────────────────────
// DOMAIN TYPES — shared across app, API, and components
// ─────────────────────────────────────────────

/** Streaming platform (lowercase for UI and PlatformIcon) */
export type Platform = 'twitch' | 'kick';

/** Report severity level */
export type Severity = 'low' | 'medium' | 'high';

// ─────────────────────────────────────────────
// AUTH — real session user shape (from NextAuth)
// ─────────────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;       // displayName — matches votes.voters
  username: string;   // platform handle
  platform: string;   // lowercase: 'twitch' | 'kick'
  role: string;       // 'USER' | 'MOD' | 'STREAMER' | 'ADMIN'
  image?: string | null;
}

// ─────────────────────────────────────────────
// REPORT — frontend data contract
// Shape returned by GET /api/reports and used in all UI components.
// Kept flat and display-ready; no nested DB models.
// ─────────────────────────────────────────────

export interface Report {
  id: string;
  steamId: string;
  steamName: string;
  steamAvatarUrl?: string | null;
  reportedBy: string;
  submittedBy: string | null;
  platform: Platform;
  game: string;
  date: string;
  description: string;
  proofLinks: string[];
  reportCount: number;
  severity: Severity;
  votes: {
    total: number;
    voters: string[]; // displayNames of users who voted
  };
  appealCount: number;
}

// ─────────────────────────────────────────────
// APPEAL
// ─────────────────────────────────────────────

export type AppealStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export interface Appeal {
  id: string;
  reportId: string;
  steamId: string;
  reason: string;
  contact: string | null;
  status: AppealStatus;
  createdAt: string;
}

// ─────────────────────────────────────────────
// FORMS
// ─────────────────────────────────────────────

export interface ReportFormData {
  steamId: string;
  steamName: string;
  game: string;
  description: string;
  proofLinks: string[];
}

// ─────────────────────────────────────────────
// API REQUEST BODIES
// ─────────────────────────────────────────────

/** Body for POST /api/reports — user identity comes from session, not body */
export interface CreateReportBody {
  steamId: string;
  steamName: string;
  game: string;
  description: string;
  proofLinks: string[];
  severity?: string;
}
