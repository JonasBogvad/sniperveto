'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserSnippet {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  platform: string;
  role?: string;
}

interface ModEntry {
  assignedAt: string;
  mod: UserSnippet;
}

interface StreamerEntry extends UserSnippet {
  mods: ModEntry[];
}

interface GameEntry {
  id: string;
  name: string;
  createdAt: string;
}

interface ReportSnippet {
  id: string;
  game: string;
  severity: string;
  status: string;
  createdAt: string;
  steamAccount: { steamId: string; steamName: string };
  reportedBy: { username: string; displayName: string };
  submittedBy: { username: string; displayName: string } | null;
}

// ─── User search input with debounce ────────────────────────────────────────

function UserSearchInput({
  placeholder,
  onSelect,
  excludeIds,
}: {
  placeholder: string;
  onSelect: (user: UserSnippet) => void;
  excludeIds?: string[];
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<UserSnippet[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as UserSnippet[];
      setResults(data.filter((u) => !excludeIds?.includes(u.id)));
    } finally {
      setLoading(false);
    }
  }, [excludeIds]);

  return (
    <div className="relative">
      <input
        type="text"
        value={q}
        onChange={(e) => { setQ(e.target.value); void search(e.target.value); }}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-sv-text placeholder:text-sv-text-3 focus:outline-none focus:border-sv-brand"
      />
      {loading && (
        <p className="absolute top-full left-0 mt-1 text-xs text-sv-text-3">Searching…</p>
      )}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-sv-surface border border-white/10 rounded-lg overflow-hidden z-10 shadow-lg">
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => { onSelect(u); setQ(''); setResults([]); }}
              className="cursor-pointer w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2"
            >
              <span className="text-sv-text font-medium">{u.displayName}</span>
              <span className="text-sv-text-3">@{u.username}</span>
              {u.role && u.role !== 'USER' && (
                <span className="ml-auto text-blue-400 font-bold">{u.role[0]}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────

export default function AdminPanel({
  streamers: initial,
  games: initialGames,
  reports: initialReports,
}: {
  streamers: StreamerEntry[];
  games: GameEntry[];
  reports: ReportSnippet[];
}) {
  const [streamers, setStreamers] = useState(initial);
  const [games, setGames] = useState(initialGames);
  const [reports, setReports] = useState(initialReports);
  const [reportSearch, setReportSearch] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [newGame, setNewGame] = useState('');
  const [gameError, setGameError] = useState<string | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Add game ──
  async function handleAddGame() {
    const name = newGame.trim();
    if (!name) return;
    setGameError(null);
    setGameLoading(true);
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setGameError(j.error ?? 'Failed to add game');
        return;
      }
      const game = (await res.json()) as GameEntry;
      setGames((prev) => [...prev, game].sort((a, b) => a.name.localeCompare(b.name)));
      setNewGame('');
    } finally {
      setGameLoading(false);
    }
  }

  // ── Delete game ──
  async function handleDeleteGame(id: string) {
    setGameError(null);
    const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setGameError(j.error ?? 'Failed to delete game');
      return;
    }
    setGames((prev) => prev.filter((g) => g.id !== id));
  }

  // ── Delete report ──
  async function handleDeleteReport(id: string) {
    setReportError(null);
    const res = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setReportError(j.error ?? 'Failed to delete report');
      return;
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  // ── Promote user to STREAMER ──
  async function handlePromote(user: UserSnippet) {
    setError(null);
    const res = await fetch(`/api/admin/users/${user.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'STREAMER' }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? 'Failed to promote');
      return;
    }
    const newStreamer: StreamerEntry = { ...user, mods: [] };
    setStreamers((prev) => {
      if (prev.find((s) => s.id === user.id)) return prev;
      return [...prev, newStreamer].sort((a, b) => a.displayName.localeCompare(b.displayName));
    });
  }

  // ── Demote STREAMER back to USER ──
  async function handleDemote(streamerId: string) {
    setError(null);
    const res = await fetch(`/api/admin/users/${streamerId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'USER' }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? 'Failed to demote');
      return;
    }
    setStreamers((prev) => prev.filter((s) => s.id !== streamerId));
    if (expandedId === streamerId) setExpandedId(null);
  }

  // ── Add mod to a streamer ──
  async function handleAddMod(streamerId: string, mod: UserSnippet) {
    setError(null);
    const res = await fetch(`/api/admin/streamers/${streamerId}/mods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modId: mod.id }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? 'Failed to add mod');
      return;
    }
    setStreamers((prev) =>
      prev.map((s) =>
        s.id === streamerId
          ? { ...s, mods: [...s.mods, { mod, assignedAt: new Date().toISOString() }] }
          : s,
      ),
    );
  }

  // ── Remove mod from a streamer ──
  async function handleRemoveMod(streamerId: string, modId: string) {
    setError(null);
    const res = await fetch(`/api/admin/streamers/${streamerId}/mods/${modId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? 'Failed to remove mod');
      return;
    }
    setStreamers((prev) =>
      prev.map((s) =>
        s.id === streamerId
          ? { ...s, mods: s.mods.filter((m) => m.mod.id !== modId) }
          : s,
      ),
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-xs text-sv-danger bg-sv-danger/10 border border-sv-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* ── Games section ── */}
      <div className="bg-sv-surface border border-white/10 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold">Games</h2>
        <p className="text-xs text-sv-text-3">
          Manage the list of games available in the report form.
        </p>
        {gameError && (
          <p className="text-xs text-sv-danger bg-sv-danger/10 border border-sv-danger/20 rounded-lg px-3 py-2">
            {gameError}
          </p>
        )}
        <div className="flex gap-2">
          <Input
            value={newGame}
            onChange={(e) => setNewGame(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleAddGame(); } }}
            placeholder="Game name…"
            className="bg-white/5 border-white/10 text-sv-text placeholder:text-sv-text-3 text-xs h-8"
          />
          <Button
            size="sm"
            onClick={() => void handleAddGame()}
            disabled={gameLoading || !newGame.trim()}
            className="bg-sv-brand hover:bg-sv-brand/90 text-white text-xs h-8 px-3 shrink-0"
          >
            Add
          </Button>
        </div>
        {games.length > 0 ? (
          <div className="space-y-1">
            {games.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 rounded-lg"
              >
                <span className="text-xs text-sv-text">{g.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void handleDeleteGame(g.id)}
                  className="text-sv-text-3 hover:text-sv-danger hover:bg-sv-danger/10 text-xs h-6 px-2 shrink-0"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-sv-text-3 py-1">No games added yet.</p>
        )}
      </div>

      {/* ── Reports section ── */}
      <div className="bg-sv-surface border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Reports</h2>
          <span className="text-xs text-sv-text-3">{reports.length} total</span>
        </div>
        {reportError && (
          <p className="text-xs text-sv-danger bg-sv-danger/10 border border-sv-danger/20 rounded-lg px-3 py-2">
            {reportError}
          </p>
        )}
        <input
          type="text"
          value={reportSearch}
          onChange={(e) => setReportSearch(e.target.value)}
          placeholder="Search by Steam name, ID, or streamer…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-sv-text placeholder:text-sv-text-3 focus:outline-none focus:border-sv-brand"
        />
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {reports
            .filter((r) => {
              if (!reportSearch) return true;
              const q = reportSearch.toLowerCase();
              return (
                r.steamAccount.steamName.toLowerCase().includes(q) ||
                r.steamAccount.steamId.includes(q) ||
                r.reportedBy.username.toLowerCase().includes(q)
              );
            })
            .map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-xs text-sv-text font-medium truncate">
                    {r.steamAccount.steamName}{' '}
                    <span className="text-sv-text-3 font-normal">· {r.game}</span>
                  </p>
                  <p className="text-xs text-sv-text-3 truncate">
                    @{r.reportedBy.username}
                    {r.submittedBy ? ` · mod: @${r.submittedBy.username}` : ''}
                    {' · '}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void handleDeleteReport(r.id)}
                  className="text-sv-text-3 hover:text-sv-danger hover:bg-sv-danger/10 text-xs h-6 px-2 shrink-0"
                >
                  Delete
                </Button>
              </div>
            ))}
          {reports.length === 0 && (
            <p className="text-xs text-sv-text-3 py-1">No reports yet.</p>
          )}
        </div>
      </div>

      {/* ── Promote section ── */}
      <div className="bg-sv-surface border border-white/10 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold">Add Streamer</h2>
        <p className="text-xs text-sv-text-3">
          Search for a user who has already logged in and promote them to Streamer.
        </p>
        <UserSearchInput
          placeholder="Search by username…"
          onSelect={(u) => void handlePromote(u)}
          excludeIds={streamers.map((s) => s.id)}
        />
      </div>

      {/* ── Streamers list ── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">
          Streamers{' '}
          <span className="text-sv-text-3 font-normal">({streamers.length})</span>
        </h2>

        {streamers.length === 0 ? (
          <p className="text-sv-text-3 text-sm py-4 text-center">No streamers registered yet.</p>
        ) : (
          streamers.map((streamer) => {
            const expanded = expandedId === streamer.id;
            return (
              <div
                key={streamer.id}
                className="bg-sv-surface border border-white/10 rounded-xl overflow-hidden"
              >
                {/* Streamer header row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setExpandedId(expanded ? null : streamer.id)}
                    className="cursor-pointer flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <span className="text-xs text-sv-text-3 w-4">{expanded ? '▾' : '▸'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{streamer.displayName}</p>
                      <p className="text-xs text-sv-text-3">
                        @{streamer.username} · {streamer.mods.length} mod
                        {streamer.mods.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleDemote(streamer.id)}
                    className="text-sv-danger hover:bg-sv-danger/10 hover:text-sv-danger text-xs h-7 px-3 flex-shrink-0"
                  >
                    Remove
                  </Button>
                </div>

                {/* Expanded mod management */}
                {expanded && (
                  <div className="border-t border-white/10 p-4 space-y-3 bg-white/[0.02]">
                    {/* Add mod search */}
                    <p className="text-xs font-medium text-sv-text-2">Add Mod</p>
                    <UserSearchInput
                      placeholder="Search user to add as mod…"
                      onSelect={(u) => void handleAddMod(streamer.id, u)}
                      excludeIds={[streamer.id, ...streamer.mods.map((m) => m.mod.id)]}
                    />

                    {/* Current mods */}
                    {streamer.mods.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {streamer.mods.map((entry) => (
                          <div
                            key={entry.mod.id}
                            className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 rounded-lg"
                          >
                            <div className="min-w-0">
                              <span className="text-xs text-sv-text font-medium">
                                {entry.mod.displayName}
                              </span>
                              <span className="text-xs text-sv-text-3 ml-1.5">
                                @{entry.mod.username}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void handleRemoveMod(streamer.id, entry.mod.id)}
                              className="text-sv-text-3 hover:text-sv-danger hover:bg-sv-danger/10 text-xs h-6 px-2 flex-shrink-0"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {streamer.mods.length === 0 && (
                      <p className="text-xs text-sv-text-3 py-2">No mods assigned yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
