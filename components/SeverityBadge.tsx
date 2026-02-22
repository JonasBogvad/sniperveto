import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Severity } from '@/types';

interface SeverityBadgeProps {
  severity: Severity;
  reportCount: number;
}

const colors: Record<Severity, string> = {
  high: 'bg-red-500 hover:bg-red-500',
  medium: 'bg-amber-500 hover:bg-amber-500',
  low: 'bg-green-500 hover:bg-green-500',
};

const SeverityBadge = ({ severity, reportCount }: SeverityBadgeProps) => (
  <Badge className={cn('text-white border-0', colors[severity])}>
    {reportCount} {reportCount === 1 ? 'report' : 'reports'}
  </Badge>
);

export default SeverityBadge;
