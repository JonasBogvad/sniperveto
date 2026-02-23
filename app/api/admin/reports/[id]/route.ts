import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// DELETE /api/admin/reports/[id] — ADMIN only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    await db.report.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const isNotFound =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025';
    if (isNotFound)
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    console.error('[DELETE /api/admin/reports/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
