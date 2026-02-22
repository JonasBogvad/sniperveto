import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import ModsManager from './ModsManager';

export const metadata: Metadata = { title: 'My Mods — SniperVeto' };

export default async function MyModsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STREAMER') redirect('/');

  const rows = await db.streamerMod.findMany({
    where: { streamerId: session.user.id },
    include: {
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
  });

  const mods = rows.map((r) => ({
    ...r.mod,
    assignedAt: r.assignedAt.toISOString(),
  }));

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">My Mods</h1>
        <p className="text-sm text-sv-text-3 mt-1">
          Mods you add here can submit reports and review appeals on your behalf.
        </p>
      </div>
      <ModsManager initialMods={mods} />
    </main>
  );
}
