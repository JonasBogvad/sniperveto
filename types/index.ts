// ─────────────────────────────────────────────
// DOMAIN TYPES — shared across app, API, and components
// ─────────────────────────────────────────────

/** Streaming platform (lowercase for UI; uppercase when sending to DB enum) */
export type Platform = 'twitch' | 'kick' | 'youtube';

/** Report severity level */
export type Severity = 'low' | 'medium' | 'high';

// ─────────────────────────────────────────────
// AUTH — mock user shape (replaced by NextAuth session later)
// ─────────────────────────────────────────────

export interface MockUser {
  type: 'streamer' | 'mod';
  name: string;
  platform: Platform;
  verified?: boolean;
  streamerName?: string; // mod only
  mods?: string[];       // streamer only
}

export interface MockStreamer {
  platform: Platform;
  mods: string[];
  verified: boolean;
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
    voters: string[];
  };
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

/** Body for POST /api/reports */
export interface CreateReportBody {
  steamId: string;
  steamName: string;
  game: string;
  platform: string;
  description: string;
  proofLinks: string[];
  severity?: string;
  reportedBy: { username: string; platform: string };
  submittedBy?: { username: string; platform: string };
}

/** Body for POST /api/reports/[id]/vote */
export interface VoteBody {
  username: string;
  platform: string;
}
