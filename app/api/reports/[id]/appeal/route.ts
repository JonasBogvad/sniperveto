import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAppealToken } from '@/lib/steam-appeal';
import { notifyDiscordNewAppeal } from '@/lib/discord';

// ─────────────────────────────────────────────
// POST /api/reports/[id]/appeal
// Requires a valid steam_appeal_token cookie (set after Steam OpenID login).
// The verified Steam ID must match the report's steam account.
// ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: reportId } = await params;

  // Verify Steam identity from cookie
  const token = req.cookies.get('steam_appeal_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Steam verification required' }, { status: 401 });
  }
  const verifiedSteamId = verifyAppealToken(token);
  if (!verifiedSteamId) {
    return NextResponse.json({ error: 'Steam verification expired or invalid' }, { status: 401 });
  }

  const body = (await req.json()) as { reason?: string; contact?: string };
  const { reason, contact } = body;

  if (!reason?.trim()) {
    return NextResponse.json({ error: 'reason is required' }, { status: 400 });
  }

  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { steamAccount: true },
  });
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.steamAccount.steamId !== verifiedSteamId) {
    return NextResponse.json(
      { error: 'Verified Steam account does not match the reported account' },
      { status: 403 },
    );
  }

  await db.reportAppeal.create({
    data: {
      reportId,
      steamId: verifiedSteamId,
      reason: reason.trim(),
      contact: contact?.trim() || null,
    },
  });

  void notifyDiscordNewAppeal({
    reportId,
    steamId: verifiedSteamId,
    steamName: report.steamAccount.steamName,
    reason: reason.trim(),
    contact: contact?.trim() || null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
