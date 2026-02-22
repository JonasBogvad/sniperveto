import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// DELETE /api/my/mods/[modId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ modId: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STREAMER')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { modId } = await params;
  const streamerId = session.user.id;

  await db.streamerMod.deleteMany({ where: { streamerId, modId } });

  return NextResponse.json({ ok: true });
}
