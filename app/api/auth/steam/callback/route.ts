import { NextRequest, NextResponse } from 'next/server';
import { createAppealToken } from '@/lib/steam-appeal';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SteamAuth = require('node-steam-openid') as {
  new (opts: { realm: string; returnUrl: string; apiKey: string }): {
    authenticate(req: { url: string }): Promise<{ steamid: string }>;
  };
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const origin = req.nextUrl.origin;
  const returnTo = req.cookies.get('steam_auth_return')?.value ?? '/';

  const steam = new SteamAuth({
    realm: origin,
    returnUrl: `${origin}/api/auth/steam/callback`,
    apiKey: process.env.STEAM_API_KEY!,
  });

  try {
    const user = await steam.authenticate({ url: req.url });

    const response = NextResponse.redirect(new URL(returnTo, origin));
    response.cookies.set('steam_appeal_token', createAppealToken(user.steamid), {
      httpOnly: true,
      maxAge: 900,
      sameSite: 'lax',
      path: '/',
    });
    response.cookies.delete('steam_auth_return');
    return response;
  } catch (err) {
    console.error('[steam auth] authentication failed:', err);
    return NextResponse.redirect(new URL('/', origin));
  }
}
