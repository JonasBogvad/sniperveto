import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SeverityBadge = ({ severity, reportCount }) => {
    const colors = {
        high: 'bg-red-500 hover:bg-red-500',
        medium: 'bg-amber-500 hover:bg-amber-500',
        low: 'bg-green-500 hover:bg-green-500'
    };

    return (
        <Badge className={cn('text-white border-0', colors[severity])}>
            {reportCount} {reportCount === 1 ? 'report' : 'reports'}
        </Badge>
    );
};

export default SeverityBadge;
