import NextAuth from 'next-auth';
import Twitch from 'next-auth/providers/twitch';
import { db } from '@/lib/db';

const platformMap: Record<string, 'TWITCH' | 'YOUTUBE'> = {
  twitch: 'TWITCH',
  google: 'YOUTUBE',
};

interface TwitchModeratedChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
}

function getAdminUsernames(): Set<string> {
  const raw = process.env.AUTH_ADMIN_USERNAMES ?? '';
  return new Set(
    raw
      .split(',')
      .map((u) => u.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function fetchTwitchModeratedChannels(
  accessToken: string,
  twitchUserId: string,
): Promise<TwitchModeratedChannel[]> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Client-Id': process.env.AUTH_TWITCH_ID ?? '',
  };
  const results: TwitchModeratedChannel[] = [];
  let cursor: string | undefined;

  try {
    do {
      const url = new URL('https://api.twitch.tv/helix/moderation/channels');
      url.searchParams.set('user_id', twitchUserId);
      url.searchParams.set('first', '100');
      if (cursor) url.searchParams.set('after', cursor);

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        console.error('[auth] Twitch mod channels fetch failed:', res.status);
        break;
      }
      const json = (await res.json()) as {
        data: TwitchModeratedChannel[];
        pagination?: { cursor?: string };
      };
      results.push(...(json.data ?? []));
      cursor = json.pagination?.cursor;
    } while (cursor);
  } catch (err) {
    console.error('[auth] fetchTwitchModeratedChannels error:', err);
  }

  return results;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Twitch({
      authorization: {
        params: {
          scope: 'openid user:read:email moderation:read',
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;
      const platform = platformMap[account.provider];
      if (!platform) return false;

      const platformId = account.providerAccountId;
      const twitchProfile = profile as { preferred_username?: string };
      const username = twitchProfile.preferred_username ?? user.name ?? platformId;

      const admins = getAdminUsernames();
      const isAdmin = admins.has(username.toLowerCase());

      try {
        // Determine role: admin > mod (via API) > user
        let role: 'ADMIN' | 'MOD' | 'USER' = isAdmin ? 'ADMIN' : 'USER';
        let moderatedChannels: TwitchModeratedChannel[] = [];

        if (!isAdmin && account.provider === 'twitch' && account.access_token) {
          moderatedChannels = await fetchTwitchModeratedChannels(
            account.access_token,
            platformId,
          );
          if (moderatedChannels.length > 0) role = 'MOD';
        }

        const dbUser = await db.user.upsert({
          where: { platformId_platform: { platformId, platform } },
          create: {
            username,
            displayName: user.name ?? username,
            avatarUrl: user.image ?? null,
            email: user.email ?? null,
            platform,
            platformId,
            verified: true,
            role,
          },
          update: {
            displayName: user.name ?? username,
            avatarUrl: user.image ?? null,
            email: user.email ?? null,
            verified: true,
            role,
          },
        });

        // Sync StreamerMod records for verified mod channels
        if (moderatedChannels.length > 0) {
          for (const channel of moderatedChannels) {
            const streamer = await db.user.upsert({
              where: {
                platformId_platform: {
                  platformId: channel.broadcaster_id,
                  platform: 'TWITCH',
                },
              },
              create: {
                username: channel.broadcaster_login,
                displayName: channel.broadcaster_name,
                platform: 'TWITCH',
                platformId: channel.broadcaster_id,
                verified: false,
              },
              update: {},
            });
            await db.streamerMod.upsert({
              where: {
                streamerId_modId: {
                  streamerId: streamer.id,
                  modId: dbUser.id,
                },
              },
              create: { streamerId: streamer.id, modId: dbUser.id },
              update: {},
            });
          }
        }

        return true;
      } catch (err) {
        console.error('[auth.signIn]', err);
        return false;
      }
    },

    async jwt({ token, account }) {
      if (account) {
        const platform = platformMap[account.provider];
        if (platform) {
          const platformId = account.providerAccountId;
          const dbUser = await db.user.findUnique({
            where: { platformId_platform: { platformId, platform } },
          });
          if (dbUser) {
            token.dbUserId = dbUser.id;
            token.role = dbUser.role;
            token.platform = dbUser.platform.toLowerCase(); // lowercase for PlatformIcon
            token.username = dbUser.username;
            token.displayName = dbUser.displayName;
            token.avatarUrl = dbUser.avatarUrl ?? undefined;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = (token.dbUserId as string) ?? '';
      session.user.username = (token.username as string) ?? '';
      session.user.platform = (token.platform as string) ?? '';
      session.user.role = (token.role as string) ?? 'USER';
      if (token.displayName) session.user.name = token.displayName as string;
      if (token.avatarUrl) session.user.image = token.avatarUrl as string;
      return session;
    },
  },
});
