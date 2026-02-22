import NextAuth from 'next-auth';
import Twitch from 'next-auth/providers/twitch';
import { db } from '@/lib/db';

const platformMap: Record<string, 'TWITCH' | 'YOUTUBE'> = {
  twitch: 'TWITCH',
  google: 'YOUTUBE',
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Twitch],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;
      const platform = platformMap[account.provider];
      if (!platform) return false;

      const platformId = account.providerAccountId;
      const twitchProfile = profile as { preferred_username?: string };
      const username = twitchProfile.preferred_username ?? user.name ?? platformId;

      try {
        await db.user.upsert({
          where: { platformId_platform: { platformId, platform } },
          create: {
            username,
            displayName: user.name ?? username,
            avatarUrl: user.image ?? null,
            email: user.email ?? null,
            platform,
            platformId,
            verified: true,
          },
          update: {
            displayName: user.name ?? username,
            avatarUrl: user.image ?? null,
            email: user.email ?? null,
            verified: true,
          },
        });
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
