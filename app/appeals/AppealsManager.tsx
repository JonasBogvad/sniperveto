'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AppealItem {
  id: string;
  reportId: string;
  steamId: string;
  steamName: string;
  reason: string;
  contact: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  game: string;
  reportedBy: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-sv-warn/10 text-sv-warn border-sv-warn/20',
  REVIEWED: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  ACCEPTED: 'bg-sv-clean/10 text-sv-clean border-sv-clean/20',
  REJECTED: 'bg-sv-danger/10 text-sv-danger border-sv-danger/20',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  REVIEWED: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

type Filter = 'ALL' | 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

interface PendingAction {
  id: string;
  action: 'accept' | 'reject';
  note: string;
}

export default function AppealsManager({ appeals: initial }: { appeals: AppealItem[] }) {
  const [appeals, setAppeals] = useState(initial);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = filter === 'ALL' ? appeals : appeals.filter((a) => a.status === filter);
  const counts = appeals.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  async function confirmAction(snapshot: PendingAction) {
    setError(null);
    setSubmitting(snapshot.id);
    try {
      const res = await fetch(`/api/appeals/${snapshot.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: snapshot.action,
          note: snapshot.note || undefined,
        }),
      });
      const json = (await res.json()) as { status?: string; error?: string };
      if (res.ok && json.status) {
        setAppeals((prev) =>
          prev.map((a) =>
            a.id === snapshot.id
              ? { ...a, status: json.status!, reviewNote: snapshot.note || null }
              : a,
          ),
        );
        setPendingAction(null);
      } else {
        setError(json.error ?? `Request failed (${res.status})`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(null);
    }
  }

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'ALL', label: `All${appeals.length > 0 ? ` (${appeals.length})` : ''}` },
    { value: 'PENDING', label: `Pending${counts.PENDING ? ` (${counts.PENDING})` : ''}` },
    { value: 'REVIEWED', label: `Reviewed${counts.REVIEWED ? ` (${counts.REVIEWED})` : ''}` },
    { value: 'ACCEPTED', label: `Accepted${counts.ACCEPTED ? ` (${counts.ACCEPTED})` : ''}` },
    { value: 'REJECTED', label: `Rejected${counts.REJECTED ? ` (${counts.REJECTED})` : ''}` },
  ];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-white/15 text-sv-text'
                : 'text-sv-text-3 hover:text-sv-text-2 hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Global error banner */}
      {error && (
        <p className="text-xs text-sv-danger bg-sv-danger/10 border border-sv-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-sv-text-3 text-sm py-8 text-center">No appeals in this category.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((appeal) => {
            const isActing = pendingAction?.id === appeal.id;
            return (
              <div
                key={appeal.id}
                className="bg-sv-surface border border-white/10 rounded-xl p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{appeal.steamName}</p>
                    <p className="text-sv-text-3 font-mono text-xs">{appeal.steamId}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                      STATUS_STYLES[appeal.status] ?? 'text-sv-text-3'
                    }`}
                  >
                    {STATUS_LABELS[appeal.status] ?? appeal.status}
                  </span>
                </div>

                {/* Context */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-sv-text-3">
                  <span>
                    Game: <span className="text-sv-text-2">{appeal.game}</span>
                  </span>
                  <span>·</span>
                  <span>
                    Reported by: <span className="text-sv-text-2">{appeal.reportedBy}</span>
                  </span>
                  <span>·</span>
                  <span>{new Date(appeal.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Reason from the accused */}
                <p className="text-sv-text-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                  {appeal.reason}
                </p>

                {/* Discord contact */}
                {appeal.contact && (
                  <p className="text-xs text-sv-text-3">
                    Discord: <span className="text-sv-text-2">{appeal.contact}</span>
                  </p>
                )}

                {/* Mod review note (shown after decision) */}
                {appeal.reviewNote && appeal.status !== 'PENDING' && (
                  <p className="text-xs text-sv-text-3 bg-white/5 rounded-lg px-3 py-2">
                    <span className="font-medium text-sv-text-2">Mod note:</span>{' '}
                    {appeal.reviewNote}
                  </p>
                )}

                {/* Inline action form */}
                {isActing ? (
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <p className="text-xs text-sv-text-2 font-medium">
                      {pendingAction.action === 'reject' ? 'Decline reason' : 'Note'}{' '}
                      <span className="text-sv-text-3 font-normal">(optional)</span>
                    </p>
                    <textarea
                      value={pendingAction.note}
                      onChange={(e) =>
                        setPendingAction((prev) =>
                          prev ? { ...prev, note: e.target.value } : prev,
                        )
                      }
                      rows={2}
                      placeholder={
                        pendingAction.action === 'reject'
                          ? 'Explain why the appeal was declined…'
                          : 'Any notes for the record…'
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-sv-text placeholder:text-sv-text-3 focus:outline-none focus:border-sv-brand resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setPendingAction(null); setError(null); }}
                        disabled={submitting === appeal.id}
                        className="text-sv-text-3 text-xs h-7 px-3"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => void confirmAction(pendingAction)}
                        disabled={submitting === appeal.id}
                        className={`text-xs h-7 px-3 ${
                          pendingAction.action === 'reject'
                            ? 'bg-sv-danger/20 hover:bg-sv-danger/30 text-sv-danger'
                            : 'bg-sv-clean/20 hover:bg-sv-clean/30 text-sv-clean'
                        }`}
                      >
                        {submitting === appeal.id
                          ? 'Saving…'
                          : pendingAction.action === 'reject'
                            ? 'Confirm Decline'
                            : 'Confirm Accept'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1 items-center">
                    <a
                      href={`/?report=${appeal.reportId}`}
                      className="text-xs text-sv-text-3 hover:text-sv-text-2 transition-colors underline underline-offset-2"
                    >
                      View report
                    </a>
                    {appeal.status === 'PENDING' && (
                      <div className="flex gap-2 ml-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setPendingAction({ id: appeal.id, action: 'reject', note: '' })
                          }
                          className="text-sv-danger hover:text-sv-danger hover:bg-sv-danger/10 text-xs h-7 px-3"
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            setPendingAction({ id: appeal.id, action: 'accept', note: '' })
                          }
                          className="bg-sv-clean/20 hover:bg-sv-clean/30 text-sv-clean text-xs h-7 px-3"
                        >
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
