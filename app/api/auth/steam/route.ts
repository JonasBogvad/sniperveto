import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SteamAuth = require('node-steam-openid') as {
  new (opts: { realm: string; returnUrl: string; apiKey: string }): {
    getRedirectUrl(): Promise<string>;
  };
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const returnTo = req.nextUrl.searchParams.get('returnTo') ?? '/';
  const origin = req.nextUrl.origin;

  const steam = new SteamAuth({
    realm: origin,
    returnUrl: `${origin}/api/auth/steam/callback`,
    apiKey: process.env.STEAM_API_KEY!,
  });

  const redirectUrl = await steam.getRedirectUrl();

  // Store returnTo in a short-lived cookie — cleaner than passing it through Steam's redirect
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('steam_auth_return', returnTo, {
    httpOnly: true,
    maxAge: 300,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
