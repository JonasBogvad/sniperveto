import { db } from '@/lib/db';
import ReportPageClient from './ReportPageClient';

export default async function ReportPage() {
  const games = await db.game.findMany({ orderBy: { name: 'asc' } });
  const gameNames = games.map((g) => g.name);

  return (
    <main className="py-6">
      <ReportPageClient games={gameNames} />
    </main>
  );
}
