import { NextRequest, NextResponse } from 'next/server';

// Proxies the token exchange request to Kick's OAuth server.
// This sits between NextAuth's oauth4webapi and Kick's endpoint,
// giving us full visibility and control over the exact request/response.
export async function POST(req: NextRequest) {
  const body = await req.text();

  // oauth4webapi sends client credentials as HTTP Basic Auth header, but
  // Kick requires client_id and client_secret in the POST body. Inject them.
  const params = new URLSearchParams(body);
  if (!params.has('client_id')) params.set('client_id', process.env.AUTH_KICK_ID ?? '');
  if (!params.has('client_secret')) params.set('client_secret', process.env.AUTH_KICK_SECRET ?? '');

  console.log('[kick-token-proxy] forwarding params:', [...params.keys()].join(', '));

  const res = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? 'application/json';

  console.log('[kick-token-proxy] response:', res.status, contentType, text.slice(0, 500));

  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': contentType.includes('json') ? contentType : 'application/json' },
  });
}
