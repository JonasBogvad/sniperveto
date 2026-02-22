import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      platform: string;
      role: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    dbUserId?: string;
    role?: string;
    platform?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  }
}
