'use client';

import { useSession } from 'next-auth/react';
import type { AppUser } from '@/types';

/** Thin wrapper around useSession — returns the real authenticated user. */
export function useUser(): { user: AppUser | null } {
  const { data: session } = useSession();
  if (!session?.user?.id) return { user: null };
  return { user: session.user as AppUser };
}
