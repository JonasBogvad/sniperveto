'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ReportCard from '@/components/ReportCard';
import ReportDetailModal from '@/components/ReportDetailModal';
import { useUser } from '@/lib/user-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Report } from '@/types';

export default function HomePage() {
  const { user } = useUser();
  const { data: session } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGame, setFilterGame] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) setReports((await res.json()) as Report[]);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleVote = async (reportId: string) => {
    if (!session?.user) return;

    // Optimistic update — votes.voters contains displayNames
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId && !r.votes.voters.includes(session.user.name ?? '')
          ? { ...r, votes: { total: r.votes.total + 1, voters: [...r.votes.voters, session.user.name ?? ''] } }
          : r,
      ),
    );

    try {
      await fetch(`/api/reports/${reportId}/vote`, { method: 'POST' });
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      searchQuery === '' ||
      r.steamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.steamId.includes(searchQuery) ||
      r.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (filterGame === 'all' || r.game === filterGame);
  });

  const games = [...new Set(reports.map((r) => r.game))];

  return (
    <>
      <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Sniper Database</h2>
          <p className="text-sv-text-2 text-xs sm:text-sm">Browse reported snipers</p>
        </div>
        <a
          href="/api/reports/export"
          download
          className="text-xs text-sv-text-3 hover:text-sv-text-2 underline underline-offset-2 shrink-0 mt-1"
        >
          Export CSV
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 sm:py-2.5 text-sm text-white placeholder-gray-500"
          />
        </div>
        <Select value={filterGame} onValueChange={setFilterGame}>
          <SelectTrigger className="w-full sm:w-48 bg-sv-surface border-white/10 text-sv-text text-sm">
            <SelectValue placeholder="All Games" />
          </SelectTrigger>
          <SelectContent className="bg-sv-surface border-white/10">
            <SelectItem value="all">All Games</SelectItem>
            {games.map((game) => (
              <SelectItem key={game} value={game}>{game}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 sm:py-16">
          <p className="text-gray-400 text-sm">Loading reports...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={setSelectedReport}
                user={user}
                onVote={handleVote}
              />
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-400 text-sm">No reports found</p>
            </div>
          )}
        </>
      )}

      <ReportDetailModal
        report={selectedReport}
        open={selectedReport != null}
        onClose={() => setSelectedReport(null)}
        user={user}
        onVote={handleVote}
      />
    </>
  );
}
