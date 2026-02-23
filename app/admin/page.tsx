import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import AdminPanel from './AdminPanel';

export const metadata: Metadata = { title: 'Admin — SniperVeto' };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const [streamers, games, reports] = await Promise.all([
    db.user.findMany({
      where: { role: 'STREAMER' },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        platform: true,
        mods: {
          select: {
            assignedAt: true,
            mod: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                platform: true,
              },
            },
          },
          orderBy: { assignedAt: 'asc' },
        },
      },
      orderBy: { displayName: 'asc' },
    }),
    db.game.findMany({ orderBy: { name: 'asc' } }),
    db.report.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        game: true,
        severity: true,
        status: true,
        createdAt: true,
        steamAccount: { select: { steamId: true, steamName: true } },
        reportedBy: { select: { username: true, displayName: true } },
        submittedBy: { select: { username: true, displayName: true } },
      },
    }),
  ]);

  // Serialize dates
  const serialized = streamers.map((s) => ({
    ...s,
    mods: s.mods.map((m) => ({ ...m, assignedAt: m.assignedAt.toISOString() })),
  }));

  const serializedGames = games.map((g) => ({ ...g, createdAt: g.createdAt.toISOString() }));
  const serializedReports = reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <AdminPanel streamers={serialized} games={serializedGames} reports={serializedReports} />
    </main>
  );
}
