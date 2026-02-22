import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchReports } from '@/lib/reports';
import type { CreateReportBody } from '@/types';

// Maps frontend platform string → DB enum string
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
// GET /api/reports
// ─────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  try {
    const reports = await fetchReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('[GET /api/reports]', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// POST /api/reports
// Creates SteamAccount (upsert) + Report + ProofLinks in a transaction.
// Upserts temporary User records until real auth is wired.
// ─────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as CreateReportBody;
    const { steamId, steamName, game, platform, description, proofLinks, severity, reportedBy, submittedBy } = body;

    if (!steamId || !game || !platform || !description || !reportedBy?.username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dbPlatform = toDbPlatform(platform);
    const reporterPlatform = toDbPlatform(reportedBy.platform);

    const report = await db.$transaction(async (tx) => {
      // 1. Upsert steam account
      const steamAccount = await tx.steamAccount.upsert({
        where: { steamId },
        create: { steamId, steamName: steamName || 'Unknown' },
        update: { steamName: steamName || 'Unknown' },
      });

      // 2. Upsert reporter user (temp until auth is built)
      const reporter = await tx.user.upsert({
        where: { platformId_platform: { platformId: reportedBy.username, platform: reporterPlatform } },
        create: {
          username: reportedBy.username,
          displayName: reportedBy.username,
          platform: reporterPlatform,
          platformId: reportedBy.username,
        },
        update: {},
      });

      // 3. Optionally upsert submitter user
      let submitter = null;
      if (submittedBy?.username) {
        const submitterPlatform = toDbPlatform(submittedBy.platform);
        submitter = await tx.user.upsert({
          where: { platformId_platform: { platformId: submittedBy.username, platform: submitterPlatform } },
          create: {
            username: submittedBy.username,
            displayName: submittedBy.username,
            platform: submitterPlatform,
            platformId: submittedBy.username,
          },
          update: {},
        });
      }

      // 4. Create report
      const newReport = await tx.report.create({
        data: {
          steamAccountId: steamAccount.id,
          reportedById: reporter.id,
          submittedById: submitter?.id ?? null,
          game,
          platform: dbPlatform,
          severity: toDbSeverity(severity),
          description,
        },
      });

      // 5. Create proof links
      if (proofLinks && proofLinks.length > 0) {
        const validLinks = proofLinks.filter((url) => url.trim() !== '');
        if (validLinks.length > 0) {
          await tx.proofLink.createMany({
            data: validLinks.map((url) => ({ reportId: newReport.id, url })),
          });
        }
      }

      return newReport;
    });

    return NextResponse.json({ id: report.id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reports]', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
