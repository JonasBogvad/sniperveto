import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET /api/admin/games — public, used by report form
export async function GET(): Promise<NextResponse> {
  try {
    const games = await db.game.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(games);
  } catch (error) {
    console.error('[GET /api/admin/games]', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

// POST /api/admin/games — ADMIN only
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as { name?: string };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  try {
    const game = await db.game.create({ data: { name } });
    return NextResponse.json(game, { status: 201 });
  } catch (error: unknown) {
    const isUniqueViolation =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002';
    if (isUniqueViolation)
      return NextResponse.json({ error: 'Game already exists' }, { status: 409 });
    console.error('[POST /api/admin/games]', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
