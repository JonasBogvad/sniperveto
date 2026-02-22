import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// DELETE /api/admin/streamers/[id]/mods/[modId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; modId: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id: streamerId, modId } = await params;

  await db.streamerMod.deleteMany({ where: { streamerId, modId } });

  return NextResponse.json({ ok: true });
}
