import crypto from 'node:crypto';

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function createAppealToken(steamId: string): string {
  const secret = process.env.AUTH_SECRET!;
  const payload = Buffer.from(
    JSON.stringify({ steamId, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAppealToken(token: string): string | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const secret = process.env.AUTH_SECRET!;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const { steamId, exp } = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    ) as { steamId: string; exp: number };
    if (Date.now() > exp) return null;
    return steamId;
  } catch {
    return null;
  }
}
