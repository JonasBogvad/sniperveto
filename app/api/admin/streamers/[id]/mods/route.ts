import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// POST /api/admin/streamers/[id]/mods
// Body: { modId: string }
// Adds a mod to a streamer and ensures the mod user has at least MOD role.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id: streamerId } = await params;
  const body = (await req.json()) as { modId?: string };
  const modId = body.modId;

  if (!modId) return NextResponse.json({ error: 'modId required' }, { status: 400 });
  if (modId === streamerId) return NextResponse.json({ error: 'Cannot mod yourself' }, { status: 400 });

  await db.streamerMod.upsert({
    where: { streamerId_modId: { streamerId, modId } },
    create: { streamerId, modId },
    update: {},
  });

  // Elevate USER to MOD (don't downgrade STREAMER/ADMIN)
  const modUser = await db.user.findUnique({ where: { id: modId }, select: { role: true } });
  if (modUser?.role === 'USER') {
    await db.user.update({ where: { id: modId }, data: { role: 'MOD' } });
  }

  const mod = await db.user.findUnique({
    where: { id: modId },
    select: { id: true, username: true, displayName: true, avatarUrl: true, platform: true, role: true },
  });

  return NextResponse.json({ ok: true, mod });
}
