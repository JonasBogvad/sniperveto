import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { VoteBody } from '@/types';

const toDbPlatform = (p: string): 'TWITCH' | 'KICK' | 'YOUTUBE' => {
  const map: Record<string, 'TWITCH' | 'KICK' | 'YOUTUBE'> = {
    twitch: 'TWITCH',
    kick: 'KICK',
    youtube: 'YOUTUBE',
  };
  return map[p.toLowerCase()] ?? 'TWITCH';
};

// ─────────────────────────────────────────────
// POST /api/reports/[id]/vote
// Upserts a ReportVote (one per user per report).
// Upserts a temp User record until real auth is wired.
// ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id: reportId } = await params;
    const body = (await req.json()) as VoteBody;
    const { username, platform } = body;

    if (!username || !platform) {
      return NextResponse.json({ error: 'Missing username or platform' }, { status: 400 });
    }

    const dbPlatform = toDbPlatform(platform);

    // Verify the report exists
    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Upsert user (temp until auth is built)
    const user = await db.user.upsert({
      where: { platformId_platform: { platformId: username, platform: dbPlatform } },
      create: {
        username,
        displayName: username,
        platform: dbPlatform,
        platformId: username,
      },
      update: {},
    });

    // Upsert vote (idempotent — voting twice is a no-op)
    await db.reportVote.upsert({
      where: { reportId_userId: { reportId, userId: user.id } },
      create: { reportId, userId: user.id },
      update: {},
    });

    // Return updated vote count
    const voteCount = await db.reportVote.count({ where: { reportId } });

    return NextResponse.json({ total: voteCount });
  } catch (error) {
    console.error('[POST /api/reports/[id]/vote]', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
