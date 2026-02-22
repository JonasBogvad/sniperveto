import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// ─────────────────────────────────────────────
// POST /api/reports/[id]/vote — requires auth
// Upserts a ReportVote (idempotent — voting twice is a no-op).
// User identity comes from the session, not the request body.
// ─────────────────────────────────────────────
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: reportId } = await params;

    // Rate limit: max 50 votes per user per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVotes = await db.reportVote.count({
      where: { userId: session.user.id, createdAt: { gte: oneHourAgo } },
    });
    if (recentVotes >= 50) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 50 votes per hour.' },
        { status: 429 },
      );
    }

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Upsert vote — DB unique constraint prevents duplicates
    await db.reportVote.upsert({
      where: { reportId_userId: { reportId, userId: session.user.id } },
      create: { reportId, userId: session.user.id },
      update: {},
    });

    const voteCount = await db.reportVote.count({ where: { reportId } });
    return NextResponse.json({ total: voteCount });
  } catch (error) {
    console.error('[POST /api/reports/[id]/vote]', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
