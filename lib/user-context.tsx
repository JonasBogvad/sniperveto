'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MockUser } from '@/types';

interface UserContextValue {
  user: MockUser | null;
  setUser: (user: MockUser | null) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => undefined,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
