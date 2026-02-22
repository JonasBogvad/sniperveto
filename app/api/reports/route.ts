import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { fetchReports } from '@/lib/reports';
import { lookupSteamProfile } from '@/lib/steam';
import { notifyDiscordNewReport } from '@/lib/discord';
import type { CreateReportBody } from '@/types';

const toDbPlatform = (p: string): 'TWITCH' | 'KICK' | 'YOUTUBE' => {
  const map: Record<string, 'TWITCH' | 'KICK' | 'YOUTUBE'> = {
    twitch: 'TWITCH',
    kick: 'KICK',
    youtube: 'YOUTUBE',
  };
  return map[p.toLowerCase()] ?? 'TWITCH';
};

const toDbSeverity = (s?: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const map: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
  };
  return map[(s ?? '').toLowerCase()] ?? 'LOW';
};

// ─────────────────────────────────────────────
// GET /api/reports — public
// ─────────────────────────────────────────────
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const steamId = req.nextUrl.searchParams.get('steamId') ?? undefined;
    const reports = await fetchReports(steamId);
    return NextResponse.json(reports);
  } catch (error) {
    console.error('[GET /api/reports]', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// POST /api/reports — requires auth
// Uses session user as the reporter. No user upsert needed — they
// already exist in the DB from the OAuth sign-in callback.
// ─────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Rate limit: max 5 reports per user per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await db.report.count({
      where: { reportedById: session.user.id, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 5 reports per hour.' },
        { status: 429 },
      );
    }

    const body = (await req.json()) as CreateReportBody;
    const { steamId, steamName, game, description, proofLinks, severity } = body;

    if (!steamId || !game || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dbPlatform = toDbPlatform(session.user.platform);

    const report = await db.$transaction(async (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => {
      // 1. Upsert steam account
      const steamAccount = await tx.steamAccount.upsert({
        where: { steamId },
        create: { steamId, steamName: steamName || 'Unknown' },
        update: { steamName: steamName || 'Unknown' },
      });

      // 2. Create report — session.user.id is the authenticated user
      const newReport = await tx.report.create({
        data: {
          steamAccountId: steamAccount.id,
          reportedById: session.user.id,
          submittedById: null,
          game,
          platform: dbPlatform,
          severity: toDbSeverity(severity),
          description,
        },
      });

      // 3. Create proof links
      const validLinks = (proofLinks ?? []).filter((url) => url.trim() !== '');
      if (validLinks.length > 0) {
        await tx.proofLink.createMany({
          data: validLinks.map((url) => ({ reportId: newReport.id, url })),
        });
      }

      return newReport;
    });

    // Enrich SteamAccount with official Steam profile data (best-effort)
    const steamProfile = await lookupSteamProfile(steamId);
    if (steamProfile) {
      await db.steamAccount.update({
        where: { steamId },
        data: {
          avatarUrl:  steamProfile.avatarmedium,
          profileUrl: steamProfile.profileurl,
          // Only overwrite name if the submitter left it blank
          ...((!steamName || steamName === 'Unknown')
            ? { steamName: steamProfile.personaname }
            : {}),
        },
      });
    }

    // Discord notification (best-effort)
    await notifyDiscordNewReport({
      id:          report.id,
      steamName:   steamName || steamProfile?.personaname || 'Unknown',
      steamId,
      reportedBy:  session.user.username ?? session.user.name ?? 'Unknown',
      game,
      severity:    severity ?? 'low',
      description,
    });

    return NextResponse.json({ id: report.id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reports]', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
