import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET /api/my/mods — list mods for the current streamer
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STREAMER')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await db.streamerMod.findMany({
    where: { streamerId: session.user.id },
    include: {
      mod: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, platform: true },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return NextResponse.json(rows.map((r) => ({ ...r.mod, assignedAt: r.assignedAt })));
}

// POST /api/my/mods — add a mod
// Body: { userId: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STREAMER')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const streamerId = session.user.id;
  const body = (await req.json()) as { userId?: string };
  const userId = body.userId;

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  if (userId === streamerId) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });

  await db.streamerMod.upsert({
    where: { streamerId_modId: { streamerId, modId: userId } },
    create: { streamerId, modId: userId },
    update: {},
  });

  // Elevate USER to MOD
  const modUser = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (modUser?.role === 'USER') {
    await db.user.update({ where: { id: userId }, data: { role: 'MOD' } });
  }

  const mod = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, displayName: true, avatarUrl: true, platform: true },
  });

  return NextResponse.json(mod);
}
