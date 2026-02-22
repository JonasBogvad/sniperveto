'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { AppealStatus } from '@/types';

const DISCORD_INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE ?? null;

const STATUS_LABELS: Record<AppealStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending review', className: 'text-sv-warn' },
  REVIEWED: { label: 'Under review', className: 'text-blue-400' },
  ACCEPTED: { label: 'Accepted', className: 'text-sv-clean' },
  REJECTED: { label: 'Rejected', className: 'text-sv-danger' },
};

function DiscordCTA({ label }: { label: string }) {
  if (!DISCORD_INVITE) {
    return <p className="text-sv-text-3 text-sm">{label}</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-sv-text-2 text-sm">{label}</p>
      <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.1 18.1.12 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
          Join Discord
        </Button>
      </a>
    </div>
  );
}

interface Props {
  reportId: string;
  reportSteamId: string;
  reportSteamName: string;
  verifiedSteamId: string | null;
  existingAppeal: { status: string; cooloffUntil: string | null; reviewNote: string | null } | null;
}

export default function AppealForm({
  reportId,
  reportSteamId,
  reportSteamName,
  verifiedSteamId,
  existingAppeal,
}: Props) {
  const [reason, setReason] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const returnTo = `/appeal/${reportId}`;
  const isOwner = verifiedSteamId === reportSteamId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/reports/${reportId}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, contact: contact || undefined }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sv-text font-semibold text-lg">Appeal submitted</p>
        <p className="text-sv-text-2 text-sm">
          Your appeal has been recorded. The mods have been notified.
        </p>
        <DiscordCTA label="Join our Discord to discuss your appeal and follow up with the community." />
        <Link href="/" className="block text-sm text-sv-text-3 hover:text-sv-text-2 transition-colors">
          ← Back to database
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold">File an Appeal</h1>
        <p className="text-sv-text-2 text-sm mt-1">
          Report for{' '}
          <span className="text-sv-text font-medium">{reportSteamName}</span>
          <span className="text-sv-text-3 font-mono text-xs ml-2">{reportSteamId}</span>
        </p>
      </div>

      {!verifiedSteamId ? (
        <div className="space-y-3">
          <p className="text-sv-text-2 text-sm">
            Verify you own this Steam account before filing an appeal.
          </p>
          <a href={`/api/auth/steam?returnTo=${encodeURIComponent(returnTo)}`}>
            <Button className="bg-[#1b2838] hover:bg-[#2a475e] text-white flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
              </svg>
              Login with Steam
            </Button>
          </a>
        </div>
      ) : !isOwner ? (
        <div className="space-y-3">
          <p className="text-sv-text-2 text-sm">
            The verified Steam account (
            <span className="text-sv-text font-mono text-xs">{verifiedSteamId}</span>) does not
            match this report (
            <span className="text-sv-text font-mono text-xs">{reportSteamId}</span>).
          </p>
          <a href={`/api/auth/steam?returnTo=${encodeURIComponent(returnTo)}`}>
            <Button variant="ghost" size="sm" className="text-sv-text-2">
              Login with a different Steam account
            </Button>
          </a>
        </div>
      ) : existingAppeal ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          {existingAppeal.cooloffUntil ? (
            <>
              <p className="text-sm font-medium text-sv-text">Appeal declined</p>
              {existingAppeal.reviewNote && (
                <p className="text-sv-text-2 text-sm">
                  <span className="text-sv-text-3">Reason: </span>
                  {existingAppeal.reviewNote}
                </p>
              )}
              <p className="text-sv-text-2 text-sm">
                You can appeal again after{' '}
                <span className="text-sv-text font-medium">
                  {new Date(existingAppeal.cooloffUntil).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                .
              </p>
              <DiscordCTA label="Join our Discord to discuss your case." />
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-sv-text">Appeal already submitted</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-sv-text-3">Status:</span>
                <span className={STATUS_LABELS[existingAppeal.status as AppealStatus]?.className ?? 'text-sv-text-2'}>
                  {STATUS_LABELS[existingAppeal.status as AppealStatus]?.label ?? existingAppeal.status}
                </span>
              </div>
              {existingAppeal.reviewNote && (
                <p className="text-sv-text-2 text-sm">
                  <span className="text-sv-text-3">Mod note: </span>
                  {existingAppeal.reviewNote}
                </p>
              )}
              <DiscordCTA label="Join our Discord to follow up on your appeal." />
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-sv-text-3">
            Verified as{' '}
            <span className="text-sv-text font-mono">{verifiedSteamId}</span>
          </p>
          <div className="space-y-2">
            <label className="text-sm text-sv-text font-medium">Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-sv-text placeholder:text-sv-text-3 focus:outline-none focus:border-sv-brand resize-none"
              placeholder="Explain why this report is incorrect..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-sv-text font-medium">Discord username (optional)</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-sv-text placeholder:text-sv-text-3 focus:outline-none focus:border-sv-brand"
              placeholder="e.g. username#1234 — so we can find you on Discord"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !reason.trim()}
            className="bg-sv-brand hover:bg-sv-brand-2"
          >
            {loading ? 'Submitting...' : 'Submit Appeal'}
          </Button>
        </form>
      )}

      <Link href="/" className="block text-sm text-sv-text-3 hover:text-sv-text-2 transition-colors">
        ← Back to database
      </Link>
    </div>
  );
}
