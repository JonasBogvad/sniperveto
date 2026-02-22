import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Appeals — SniperVeto' };

export default async function AppealsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const appeals = await db.reportAppeal.findMany({
    include: { report: { include: { steamAccount: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Appeals</h2>
        <p className="text-sv-text-2 text-sm">{appeals.length} total</p>
      </div>

      {appeals.length === 0 ? (
        <p className="text-sv-text-3 text-sm">No appeals yet.</p>
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="bg-sv-surface border border-white/10 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">
                    {appeal.report.steamAccount.steamName}
                  </p>
                  <p className="font-mono text-xs text-sv-text-3">{appeal.steamId}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    appeal.status === 'PENDING'
                      ? 'bg-sv-warn/20 text-sv-warn'
                      : appeal.status === 'ACCEPTED'
                        ? 'bg-sv-clean/20 text-sv-clean'
                        : appeal.status === 'REJECTED'
                          ? 'bg-sv-danger/20 text-sv-danger'
                          : 'bg-white/10 text-sv-text-2'
                  }`}
                >
                  {appeal.status}
                </span>
              </div>

              <p className="text-sm text-sv-text">{appeal.reason}</p>

              {appeal.contact && (
                <p className="text-xs text-sv-text-3">Contact: {appeal.contact}</p>
              )}

              <p className="text-xs text-sv-text-3">
                Filed {appeal.createdAt.toISOString().split('T')[0]} — Report ID: {appeal.reportId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
