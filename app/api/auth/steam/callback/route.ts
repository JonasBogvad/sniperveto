import { NextRequest, NextResponse } from 'next/server';
import { createAppealToken } from '@/lib/steam-appeal';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = req.nextUrl;
  const returnTo = searchParams.get('returnTo') ?? '/';

  // Build verification params — same as callback but mode = check_authentication
  const verifyParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key === 'returnTo') return;
    verifyParams.set(key, key === 'openid.mode' ? 'check_authentication' : value);
  });

  let verifyText = '';
  try {
    const res = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    });
    verifyText = await res.text();
  } catch {
    return NextResponse.redirect(new URL('/', origin));
  }

  if (!verifyText.includes('is_valid:true')) {
    return NextResponse.redirect(new URL('/', origin));
  }

  const claimedId = searchParams.get('openid.claimed_id') ?? '';
  const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1];
  if (!steamId) return NextResponse.redirect(new URL('/', origin));

  const response = NextResponse.redirect(new URL(returnTo, origin));
  response.cookies.set('steam_appeal_token', createAppealToken(steamId), {
    httpOnly: true,
    maxAge: 900,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
