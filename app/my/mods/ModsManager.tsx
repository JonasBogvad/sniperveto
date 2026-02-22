'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface ModUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  platform: string;
  assignedAt: string;
}

interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  role: string;
  platform: string;
  avatarUrl: string | null;
}

export default function ModsManager({ initialMods }: { initialMods: ModUser[] }) {
  const [mods, setMods] = useState(initialMods);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string) => {
      if (query.length < 2) { setResults([]); return; }
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as UserSearchResult[];
        // Exclude already-added mods
        setResults(data.filter((u) => !mods.find((m) => m.id === u.id)));
      } finally {
        setSearching(false);
      }
    },
    [mods],
  );

  async function handleAdd(user: UserSearchResult) {
    setError(null);
    const res = await fetch('/api/my/mods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    const json = (await res.json()) as ModUser & { error?: string };
    if (!res.ok) {
      setError(json.error ?? 'Failed to add mod');
      return;
    }
    setMods((prev) => [...prev, { ...json, assignedAt: new Date().toISOString() }]);
    setResults((prev) => prev.filter((u) => u.id !== user.id));
    setQ('');
    setResults([]);
  }

  async function handleRemove(modId: string) {
    setError(null);
    const res = await fetch(`/api/my/mods/${modId}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? 'Failed to remove mod');
      return;
    }
    setMods((prev) => prev.filter((m) => m.id !== modId));
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-sv-danger bg-sv-danger/10 border border-sv-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Search to add mod */}
      <div className="bg-sv-surface border border-white/10 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold">Add a Mod</p>
        <p className="text-xs text-sv-text-3">
          The user must have logged in at least once. Search by their username.
        </p>
        <div className="relative">
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); void search(e.target.value); }}
            placeholder="Search by username…"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-sv-text placeholder:text-sv-text-3 focus:outline-none focus:border-sv-brand"
          />
          {searching && (
            <p className="absolute top-full left-0 mt-1 text-xs text-sv-text-3">Searching…</p>
          )}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-sv-surface border border-white/10 rounded-lg overflow-hidden z-10 shadow-lg">
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => void handleAdd(u)}
                  className="cursor-pointer w-full text-left px-3 py-2.5 text-xs hover:bg-white/5 flex items-center gap-2"
                >
                  <span className="text-sv-text font-medium">{u.displayName}</span>
                  <span className="text-sv-text-3">@{u.username}</span>
                  <span className="ml-auto text-sv-text-3 capitalize">{u.platform.toLowerCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current mods list */}
      <div className="space-y-2">
        <p className="text-sm font-semibold">
          Current Mods{' '}
          <span className="text-sv-text-3 font-normal">({mods.length})</span>
        </p>

        {mods.length === 0 ? (
          <p className="text-sv-text-3 text-sm py-6 text-center">No mods added yet.</p>
        ) : (
          mods.map((mod) => (
            <div
              key={mod.id}
              className="bg-sv-surface border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{mod.displayName}</p>
                <p className="text-xs text-sv-text-3">
                  @{mod.username} · {mod.platform.toLowerCase()}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void handleRemove(mod.id)}
                className="text-sv-text-3 hover:text-sv-danger hover:bg-sv-danger/10 text-xs h-7 px-3 flex-shrink-0"
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
