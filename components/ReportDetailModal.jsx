'use client';

import PlatformIcon from '@/components/PlatformIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ReportDetailModal = ({ report, open, onClose, user, onVote }) => {
    const hasVoted = user && report?.votes.voters.includes(user.name);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-white/10 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl truncate">{report?.steamName}</DialogTitle>
                    <p className="text-gray-500 font-mono text-xs sm:text-sm truncate">{report?.steamId}</p>
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
                            <p className="text-gray-300 bg-white/5 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">{report.description}</p>
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
                                    if (user && !hasVoted) onVote(report.id);
                                }}
                                disabled={!user || hasVoted}
                                className={`flex-1 ${
                                    hasVoted
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20'
                                        : user
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-white/10 text-gray-500'
                                }`}
                            >
                                {hasVoted ? 'Voted' : '+ Vote'}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ReportDetailModal;
