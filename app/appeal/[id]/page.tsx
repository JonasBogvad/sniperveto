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

  return (
    <AppealForm
      reportId={report.id}
      reportSteamId={report.steamAccount.steamId}
      reportSteamName={report.steamAccount.steamName}
      verifiedSteamId={verifiedSteamId}
    />
  );
}
