import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// PATCH /api/admin/users/[id]/role
// Body: { role: 'STREAMER' | 'MOD' | 'USER' }
// Promoting to STREAMER also creates a StreamerProfile.
// Demoting from STREAMER also deletes the StreamerProfile.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = (await req.json()) as { role?: string };
  const { role } = body;

  if (!['USER', 'MOD', 'STREAMER'].includes(role ?? ''))
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  if (role === 'STREAMER') {
    await db.$transaction([
      db.user.update({ where: { id }, data: { role: 'STREAMER' } }),
      db.streamerProfile.upsert({
        where: { userId: id },
        create: { userId: id },
        update: {},
      }),
    ]);
  } else {
    await db.$transaction([
      db.user.update({ where: { id }, data: { role: role as 'USER' | 'MOD' } }),
      db.streamerProfile.deleteMany({ where: { userId: id } }),
    ]);
  }

  return NextResponse.json({ ok: true, role });
}
