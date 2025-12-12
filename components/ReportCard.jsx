'use client';

import PlatformIcon from '@/components/PlatformIcon';
import SeverityBadge from '@/components/SeverityBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ReportCard = ({ report, onClick, user, onVote }) => {
    const hasVoted = user && report.votes.voters.includes(user.name);

    return (
        <Card
            onClick={() => onClick(report)}
            className="bg-slate-800/50 border-white/10 cursor-pointer transition-all hover:bg-slate-800 hover:border-white/20 border-l-4 border-l-slate-600"
        >
            <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">{report.steamName}</h3>
                        <p className="text-xs text-gray-500 font-mono truncate">{report.steamId}</p>
                    </div>
                    <SeverityBadge severity={report.severity} reportCount={report.reportCount} />
                </div>

                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-2 flex-wrap">
                    <span className="flex items-center gap-1">
                        <span className="truncate">{report.game}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        {report.date}
                    </span>
                </div>

                <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-2">{report.description}</p>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-w-0">
                        <span className="text-gray-500">by</span>
                        <PlatformIcon platform={report.platform} />
                        <span className="font-medium truncate">{report.reportedBy}</span>
                        {report.submittedBy && (
                            <span className="text-gray-500 text-xs truncate">(via {report.submittedBy})</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {report.proofLinks.length > 0 && (
                            <Badge variant="secondary" className="bg-white/10 text-white border-0 text-xs">
                                {report.proofLinks.length} link{report.proofLinks.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (user && !hasVoted) onVote(report.id);
                            }}
                            className={`h-auto px-2 py-1 text-xs ${
                                hasVoted
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20'
                                    : user
                                        ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                                        : 'bg-white/5 text-gray-500 cursor-default hover:bg-white/5'
                            }`}
                        >
                            + {report.votes.total}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReportCard;
