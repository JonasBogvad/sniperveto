import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// ─────────────────────────────────────────────
// POST /api/appeals/[id]/review
// Requires MOD, STREAMER, or ADMIN role.
// Body: { action: 'accept' | 'reject', note?: string }
// ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (!['MOD', 'STREAMER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as { action?: string; note?: string };
  const { action, note } = body;

  if (action !== 'accept' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be accept or reject' }, { status: 400 });
  }

  const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

  try {
    const appeal = await db.reportAppeal.update({
      where: { id },
      data: { status: newStatus, reviewNote: note?.trim() || null },
    });
    return NextResponse.json({ ok: true, status: appeal.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[review] db update failed:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
