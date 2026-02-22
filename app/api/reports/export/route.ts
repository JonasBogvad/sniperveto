import { NextResponse } from 'next/server';
import { fetchReports } from '@/lib/reports';

function csvCell(val: string | number | null | undefined): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─────────────────────────────────────────────
// GET /api/reports/export — public CSV download
// ─────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  const reports = await fetchReports();

  const HEADERS = [
    'ID', 'Steam ID', 'Steam Name', 'Reported By', 'Submitted By',
    'Platform', 'Game', 'Date', 'Severity', 'Votes', 'Report Count',
    'Description', 'Proof Links',
  ];

  const rows = reports.map((r) => [
    csvCell(r.id),
    csvCell(r.steamId),
    csvCell(r.steamName),
    csvCell(r.reportedBy),
    csvCell(r.submittedBy),
    csvCell(r.platform),
    csvCell(r.game),
    csvCell(r.date),
    csvCell(r.severity),
    csvCell(r.votes.total),
    csvCell(r.reportCount),
    csvCell(r.description),
    csvCell(r.proofLinks.join(' | ')),
  ].join(','));

  const csv = [HEADERS.join(','), ...rows].join('\n');
  const filename = `sniperveto-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
