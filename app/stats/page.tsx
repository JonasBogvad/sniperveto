import { fetchReports } from '@/lib/reports';
import StatsView from '@/components/StatsView';

export default async function StatsPage() {
  const reports = await fetchReports();
  return <StatsView reports={reports} />;
}
