import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyDiscordNewAppeal } from '@/lib/discord';

// ─────────────────────────────────────────────
// POST /api/reports/[id]/appeal — public (no auth)
// The reported person may not have an account, so no auth is required.
// steamId must match the report's steam account to prevent spam.
// ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: reportId } = await params;

  const body = (await req.json()) as {
    steamId?: string;
    reason?: string;
    contact?: string;
  };

  const { steamId, reason, contact } = body;

  if (!steamId || !reason?.trim()) {
    return NextResponse.json({ error: 'steamId and reason are required' }, { status: 400 });
  }

  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { steamAccount: true },
  });

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.steamAccount.steamId !== steamId) {
    return NextResponse.json(
      { error: 'Steam ID does not match the reported account' },
      { status: 403 },
    );
  }

  await db.reportAppeal.create({
    data: {
      reportId,
      steamId,
      reason: reason.trim(),
      contact: contact?.trim() || null,
    },
  });

  void notifyDiscordNewAppeal({
    reportId,
    steamId,
    steamName: report.steamAccount.steamName,
    reason: reason.trim(),
    contact: contact?.trim() || null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
