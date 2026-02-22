import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import AppealsManager from './AppealsManager';

export const metadata: Metadata = { title: 'Appeals — SniperVeto' };

export default async function AppealsPage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const role = session.user.role;
  if (!['MOD', 'STREAMER', 'ADMIN'].includes(role)) redirect('/');

  const appeals = await db.reportAppeal.findMany({
    include: {
      report: {
        include: {
          steamAccount: true,
          reportedBy: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = appeals.map((a) => ({
    id: a.id,
    reportId: a.reportId,
    steamId: a.steamId,
    steamName: a.report.steamAccount.steamName,
    reason: a.reason,
    contact: a.contact,
    status: a.status as string,
    reviewNote: a.reviewNote,
    createdAt: a.createdAt.toISOString(),
    game: a.report.game,
    reportedBy: a.report.reportedBy.displayName,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Appeals</h1>
        <p className="text-sv-text-3 text-sm mt-1">
          Review and action appeals from reported Steam accounts.
        </p>
      </div>
      <AppealsManager appeals={serialized} />
    </div>
  );
}
