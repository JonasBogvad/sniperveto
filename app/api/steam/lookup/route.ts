import { NextRequest, NextResponse } from 'next/server';
import { lookupSteamProfile } from '@/lib/steam';

// ─────────────────────────────────────────────
// GET /api/steam/lookup?steamId=76561198...
// Public — proxies Steam API so the key stays server-side.
// ─────────────────────────────────────────────
export async function GET(req: NextRequest): Promise<NextResponse> {
  const steamId = req.nextUrl.searchParams.get('steamId');
  if (!steamId) {
    return NextResponse.json({ error: 'Missing steamId' }, { status: 400 });
  }

  const profile = await lookupSteamProfile(steamId);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found or Steam API unavailable' }, { status: 404 });
  }

  return NextResponse.json({
    steamId:    profile.steamid,
    steamName:  profile.personaname,
    avatarUrl:  profile.avatarmedium,
    profileUrl: profile.profileurl,
  });
}
