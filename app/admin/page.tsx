import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import AdminPanel from './AdminPanel';

export const metadata: Metadata = { title: 'Admin — SniperVeto' };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const streamers = await db.user.findMany({
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
  });

  // Serialize dates
  const serialized = streamers.map((s) => ({
    ...s,
    mods: s.mods.map((m) => ({ ...m, assignedAt: m.assignedAt.toISOString() })),
  }));

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <AdminPanel streamers={serialized} />
    </main>
  );
}
