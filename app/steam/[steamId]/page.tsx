import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';

// ─── Types ───────────────────────────────────

type ReportEvent = {
  kind: 'report';
  id: string;
  date: Date;
  game: string;
  reportedBy: string;
  submittedBy: string | null;
  severity: string;
  description: string;
  proofCount: number;
  voteCount: number;
};

type AppealFiledEvent = {
  kind: 'appeal_filed';
  id: string;
  date: Date;
  game: string;
  reason: string;
};

type AppealDecidedEvent = {
  kind: 'appeal_decided';
  id: string;
  date: Date;
  status: 'ACCEPTED' | 'REJECTED';
  reviewNote: string | null;
};

type TimelineEvent = ReportEvent | AppealFiledEvent | AppealDecidedEvent;

// ─── Helpers ─────────────────────────────────

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const SEVERITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW: 'text-sv-text-3',
  MEDIUM: 'text-sv-warn',
  HIGH: 'text-sv-danger',
};

// ─── Metadata ────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ steamId: string }>;
}): Promise<Metadata> {
  const { steamId } = await params;
  const account = await db.steamAccount.findUnique({
    where: { steamId },
    select: { steamName: true },
  });
  return {
    title: account ? `${account.steamName} — SniperVeto` : 'Steam History — SniperVeto',
  };
}

// ─── Page ────────────────────────────────────

export default async function SteamProfilePage({
  params,
}: {
  params: Promise<{ steamId: string }>;
}) {
  const { steamId } = await params;

  const account = await db.steamAccount.findUnique({
    where: { steamId },
    include: {
      reports: {
        include: {
          reportedBy: true,
          submittedBy: true,
          proofLinks: true,
          votes: true,
          appeals: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!account) notFound();

  // ── Build timeline events ──
  const events: TimelineEvent[] = [];

  for (const report of account.reports) {
    events.push({
      kind: 'report',
      id: report.id,
      date: report.createdAt,
      game: report.game,
      reportedBy: report.reportedBy.displayName,
      submittedBy: report.submittedBy?.displayName ?? null,
      severity: report.severity,
      description: report.description,
      proofCount: report.proofLinks.length,
      voteCount: report.votes.length,
    });

    for (const appeal of report.appeals) {
      events.push({
        kind: 'appeal_filed',
        id: appeal.id,
        date: appeal.createdAt,
        game: report.game,
        reason: appeal.reason,
      });

      // Emit a decision event only when a mod has actually made a decision
      if (
        appeal.status !== 'PENDING' &&
        appeal.updatedAt.getTime() - appeal.createdAt.getTime() > 1000
      ) {
        events.push({
          kind: 'appeal_decided',
          id: `${appeal.id}_decided`,
          date: appeal.updatedAt,
          status: appeal.status as 'ACCEPTED' | 'REJECTED',
          reviewNote: appeal.reviewNote,
        });
      }
    }
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // ── Summary stats ──
  const totalVotes = account.reports.reduce((s, r) => s + r.votes.length, 0);
  const totalAppeals = account.reports.reduce((s, r) => s + r.appeals.length, 0);
  const games = [...new Set(account.reports.map((r) => r.game))];
  const firstSeen = account.reports[0]?.createdAt;
  const lastSeen = account.reports.at(-1)?.createdAt;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Profile header */}
      <div className="bg-sv-surface border border-white/10 rounded-xl p-4 sm:p-5 flex gap-4 items-center">
        {account.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={account.avatarUrl}
            alt=""
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold truncate">{account.steamName}</h1>
          <p className="text-sv-text-3 font-mono text-xs mt-0.5">{account.steamId}</p>
          <a
            href={`https://steamcommunity.com/profiles/${account.steamId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-sv-text-3 hover:text-sv-text-2 transition-colors underline underline-offset-2"
          >
            Steam Profile ↗
          </a>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Reports', value: account.reports.length, color: 'text-sv-danger' },
          { label: 'Votes', value: totalVotes, color: 'text-sv-warn' },
          { label: 'Appeals', value: totalAppeals, color: 'text-blue-400' },
          { label: 'Games', value: games.length, color: 'text-sv-text' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-sv-surface border border-white/10 rounded-xl p-3 text-center"
          >
            <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sv-text-3 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Games & date range */}
      {games.length > 0 && (
        <div className="text-xs text-sv-text-3 flex flex-wrap gap-x-4 gap-y-1">
          <span>
            First seen:{' '}
            <span className="text-sv-text-2">{firstSeen ? fmtDate(firstSeen) : '-'}</span>
          </span>
          <span>
            Last seen:{' '}
            <span className="text-sv-text-2">{lastSeen ? fmtDate(lastSeen) : '-'}</span>
          </span>
          <span>
            Games: <span className="text-sv-text-2">{games.join(', ')}</span>
          </span>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h2 className="text-sm font-semibold text-sv-text-2 uppercase tracking-wide mb-4">
          Timeline
        </h2>

        {events.length === 0 ? (
          <p className="text-sv-text-3 text-sm">No events recorded yet.</p>
        ) : (
          <div className="relative">
            {events.map((event, i) => {
              const isLast = i === events.length - 1;

              if (event.kind === 'report') {
                return (
                  <TimelineRow
                    key={event.id}
                    isLast={isLast}
                    dot="bg-sv-danger/20 border-sv-danger"
                    dotLabel="R"
                    dotColor="text-sv-danger"
                    date={fmtDate(event.date)}
                    title={`Report — ${event.game}`}
                    titleColor="text-sv-danger"
                  >
                    <p className="text-sv-text-2 text-xs sm:text-sm mt-1 line-clamp-3">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-sv-text-3">
                      <span>
                        by <span className="text-sv-text-2">{event.reportedBy}</span>
                        {event.submittedBy && <span> via {event.submittedBy}</span>}
                      </span>
                      <span>·</span>
                      <span className={SEVERITY_COLOR[event.severity] ?? ''}>
                        {SEVERITY_LABEL[event.severity] ?? event.severity} severity
                      </span>
                      {event.voteCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-sv-clean">+{event.voteCount} votes</span>
                        </>
                      )}
                      {event.proofCount > 0 && (
                        <>
                          <span>·</span>
                          <span>
                            {event.proofCount} evidence{event.proofCount > 1 ? ' links' : ' link'}
                          </span>
                        </>
                      )}
                    </div>
                  </TimelineRow>
                );
              }

              if (event.kind === 'appeal_filed') {
                return (
                  <TimelineRow
                    key={event.id}
                    isLast={isLast}
                    dot="bg-sv-warn/20 border-sv-warn"
                    dotLabel="A"
                    dotColor="text-sv-warn"
                    date={fmtDate(event.date)}
                    title={`Appeal filed — ${event.game}`}
                    titleColor="text-sv-warn"
                  >
                    <p className="text-sv-text-2 text-xs sm:text-sm mt-1 line-clamp-3">
                      {event.reason}
                    </p>
                  </TimelineRow>
                );
              }

              if (event.kind === 'appeal_decided') {
                const accepted = event.status === 'ACCEPTED';
                return (
                  <TimelineRow
                    key={event.id}
                    isLast={isLast}
                    dot={
                      accepted
                        ? 'bg-sv-clean/20 border-sv-clean'
                        : 'bg-white/5 border-sv-danger/40'
                    }
                    dotLabel={accepted ? '✓' : '✗'}
                    dotColor={accepted ? 'text-sv-clean' : 'text-sv-danger'}
                    date={fmtDate(event.date)}
                    title={accepted ? 'Appeal accepted' : 'Appeal declined'}
                    titleColor={accepted ? 'text-sv-clean' : 'text-sv-text-2'}
                  >
                    {event.reviewNote && (
                      <p className="text-sv-text-2 text-xs sm:text-sm mt-1">
                        <span className="text-sv-text-3">Mod note: </span>
                        {event.reviewNote}
                      </p>
                    )}
                  </TimelineRow>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

      <Link
        href="/"
        className="block text-sm text-sv-text-3 hover:text-sv-text-2 transition-colors"
      >
        ← Back to database
      </Link>
    </div>
  );
}

// ─── Timeline row ────────────────────────────

function TimelineRow({
  isLast,
  dot,
  dotLabel,
  dotColor,
  date,
  title,
  titleColor,
  children,
}: {
  isLast: boolean;
  dot: string;
  dotLabel: string;
  dotColor: string;
  date: string;
  title: string;
  titleColor: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-4 pb-6 sm:pb-8">
      {/* Vertical connector */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/10" />
      )}

      {/* Dot */}
      <div
        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${dot}`}
      >
        <span className={`text-[10px] font-bold leading-none ${dotColor}`}>{dotLabel}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className={`text-sm font-semibold leading-tight ${titleColor}`}>{title}</p>
          <time className="text-xs text-sv-text-3 whitespace-nowrap">{date}</time>
        </div>
        {children}
      </div>
    </div>
  );
}
