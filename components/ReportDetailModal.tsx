'use client';

import { useState } from 'react';
import PlatformIcon from '@/components/PlatformIcon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Report, AppUser } from '@/types';

interface ReportDetailModalProps {
  report: Report | null;
  open: boolean;
  onClose: () => void;
  user: AppUser | null;
  onVote: (reportId: string) => void;
}

const ReportDetailModal = ({ report, open, onClose, user, onVote }: ReportDetailModalProps) => {
  const hasVoted = user != null && report?.votes.voters.includes(user.name);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealContact, setAppealContact] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealDone, setAppealDone] = useState(false);

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setAppealLoading(true);
    try {
      await fetch(`/api/reports/${report.id}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId: report.steamId, reason: appealReason, contact: appealContact || undefined }),
      });
      setAppealDone(true);
    } catch {
      // silent fail — appeal goes through next time
    } finally {
      setAppealLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-white/10 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {report?.steamAvatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={report.steamAvatarUrl} alt="" className="w-10 h-10 rounded flex-shrink-0" />
            )}
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl truncate">{report?.steamName}</DialogTitle>
              <p className="text-gray-500 font-mono text-xs sm:text-sm truncate">{report?.steamId}</p>
            </div>
          </div>
          <DialogDescription className="sr-only">Stream sniper report details</DialogDescription>
        </DialogHeader>

        {report && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Game</p>
                <p className="font-semibold text-sm truncate">{report.game}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
                <p className="font-semibold text-sm">{report.date}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Reported By</p>
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={report.platform} />
                  <span className="font-semibold text-sm truncate">{report.reportedBy}</span>
                </div>
                {report.submittedBy && (
                  <p className="text-xs text-gray-400 mt-1 truncate">via {report.submittedBy}</p>
                )}
              </div>
              <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Votes</p>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">+</span>
                  <span className="font-semibold text-sm">{report.votes.total}</span>
                  <span className="text-xs text-gray-500">({report.votes.voters.length})</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-sm">Description</h3>
              <p className="text-gray-300 bg-white/5 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                {report.description}
              </p>
            </div>

            {report.proofLinks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">Evidence</h3>
                <div className="space-y-2">
                  {report.proofLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/5 hover:bg-white/10 rounded-lg p-2 text-blue-400 hover:text-blue-300 transition text-xs sm:text-sm truncate"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2">
              <Button
                asChild
                variant="secondary"
                className="flex-1 bg-slate-700 hover:bg-slate-600"
              >
                <a
                  href={`https://steamcommunity.com/profiles/${report.steamId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Steam Profile
                </a>
              </Button>
              <Button
                onClick={() => {
                  if (user != null && !hasVoted) onVote(report.id);
                }}
                disabled={user == null || hasVoted}
                className={`flex-1 ${
                  hasVoted
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20'
                    : user != null
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-white/10 text-gray-500'
                }`}
              >
                {hasVoted ? 'Voted' : '+ Vote'}
              </Button>
            </div>

            {/* Appeal section */}
            {!showAppeal ? (
              <button
                onClick={() => setShowAppeal(true)}
                className="text-xs text-sv-text-3 hover:text-sv-text-2 underline underline-offset-2 text-left"
              >
                Is this report incorrect? File an appeal
              </button>
            ) : appealDone ? (
              <p className="text-xs text-sv-clean">Appeal submitted. Our team will review it.</p>
            ) : (
              <form onSubmit={handleAppealSubmit} className="border-t border-white/10 pt-3 space-y-2">
                <p className="text-xs font-medium text-sv-text-2">File an Appeal</p>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this report is incorrect..."
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs resize-none text-white placeholder-sv-text-3"
                />
                <Input
                  type="text"
                  placeholder="Contact (optional — email or Discord)"
                  value={appealContact}
                  onChange={(e) => setAppealContact(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-xs"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={appealLoading} className="bg-sv-brand hover:bg-sv-brand-2 text-xs">
                    {appealLoading ? 'Submitting...' : 'Submit Appeal'}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowAppeal(false)} className="text-sv-text-3 text-xs">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailModal;
