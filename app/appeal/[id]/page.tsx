import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { verifyAppealToken } from '@/lib/steam-appeal';
import AppealForm from './AppealForm';

export const metadata: Metadata = { title: 'File an Appeal — SniperVeto' };

export default async function AppealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await db.report.findUnique({
    where: { id },
    include: { steamAccount: true },
  });
  if (!report) redirect('/');

  const cookieStore = await cookies();
  const token = cookieStore.get('steam_appeal_token')?.value;
  const verifiedSteamId = token ? verifyAppealToken(token) : null;

  const COOLOFF_DAYS = 30;
  const mostRecent = verifiedSteamId
    ? await db.reportAppeal.findFirst({
        where: { reportId: id, steamId: verifiedSteamId },
        orderBy: { createdAt: 'desc' },
        select: { status: true, updatedAt: true, reviewNote: true },
      })
    : null;

  // Determine if this blocks submission or shows cool-off info
  let existingAppeal: {
    status: string;
    cooloffUntil: string | null;
    reviewNote: string | null;
  } | null = null;
  if (mostRecent) {
    if (mostRecent.status !== 'REJECTED') {
      existingAppeal = {
        status: mostRecent.status,
        cooloffUntil: null,
        reviewNote: mostRecent.reviewNote,
      };
    } else {
      const cooloffEnd = new Date(
        mostRecent.updatedAt.getTime() + COOLOFF_DAYS * 24 * 60 * 60 * 1000,
      );
      if (new Date() < cooloffEnd) {
        existingAppeal = {
          status: 'REJECTED',
          cooloffUntil: cooloffEnd.toISOString(),
          reviewNote: mostRecent.reviewNote,
        };
      }
      // else: rejected + past cool-off → existingAppeal stays null → form is shown
    }
  }

  return (
    <AppealForm
      reportId={report.id}
      reportSteamId={report.steamAccount.steamId}
      reportSteamName={report.steamAccount.steamName}
      verifiedSteamId={verifiedSteamId}
      existingAppeal={existingAppeal}
    />
  );
}
