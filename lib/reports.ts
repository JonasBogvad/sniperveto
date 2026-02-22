import { db } from '@/lib/db';
import type { Report, Platform, Severity } from '@/types';

const toFrontendPlatform = (p: string): Platform => p.toLowerCase() as Platform;
const toFrontendSeverity = (s: string): Severity => s.toLowerCase() as Severity;

/**
 * Fetches reports from the DB and shapes them to the frontend contract.
 * Pass `steamId` to filter to a single Steam account (used by the browser extension).
 */
export async function fetchReports(steamId?: string): Promise<Report[]> {
  const rows = await db.report.findMany({
    where: steamId ? { steamAccount: { steamId } } : undefined,
    include: {
      steamAccount: true,
      reportedBy: true,
      submittedBy: true,
      proofLinks: true,
      votes: { include: { user: true } },
      appeals: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const steamAccountReportCounts = await db.report.groupBy({
    by: ['steamAccountId'],
    _count: { id: true },
  });
  const countMap = new Map(
    steamAccountReportCounts.map((r) => [r.steamAccountId, r._count.id]),
  );

  return rows.map((row) => ({
    id: row.id,
    steamId: row.steamAccount.steamId,
    steamName: row.steamAccount.steamName,
    steamAvatarUrl: row.steamAccount.avatarUrl ?? null,
    reportedBy: row.reportedBy.displayName,
    submittedBy: row.submittedBy?.displayName ?? null,
    platform: toFrontendPlatform(row.platform),
    game: row.game,
    date: row.createdAt.toISOString().split('T')[0],
    description: row.description,
    proofLinks: row.proofLinks.map((pl) => pl.url),
    reportCount: countMap.get(row.steamAccountId) ?? 1,
    severity: toFrontendSeverity(row.severity),
    votes: {
      total: row.votes.length,
      voters: row.votes.map((v) => v.user.displayName),
    },
    appealCount: row.appeals.length,
  }));
}
