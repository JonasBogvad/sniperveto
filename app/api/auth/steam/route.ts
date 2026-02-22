import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const returnTo = req.nextUrl.searchParams.get('returnTo') ?? '/';
  const origin = req.nextUrl.origin;
  const callbackUrl = `${origin}/api/auth/steam/callback?returnTo=${encodeURIComponent(returnTo)}`;

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': callbackUrl,
    'openid.realm': origin,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return NextResponse.redirect(
    `https://steamcommunity.com/openid/login?${params.toString()}`,
  );
}
