const StatsView = ({ reports }) => {
    const totalReports = reports.reduce((acc, r) => acc + r.reportCount, 0);
    const uniqueSnipers = reports.length;
    const topGame = reports.reduce((acc, r) => {
        acc[r.game] = (acc[r.game] || 0) + r.reportCount;
        return acc;
    }, {});
    const mostReportedGame = Object.entries(topGame).sort((a, b) => b[1] - a[1])[0];

    return (
        <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Statistics</h2>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{totalReports}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Reports</div>
                </div>
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">{uniqueSnipers}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Snipers</div>
                </div>
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-yellow-400 mb-1 truncate">{mostReportedGame?.[0] || '-'}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Top Game</div>
                </div>
            </div>

            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 sm:p-5">
                <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">By Game</h3>
                <div className="space-y-3">
                    {Object.entries(topGame).sort((a, b) => b[1] - a[1]).map(([game, count]) => (
                        <div key={game}>
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                                <span className="truncate mr-2">{game}</span>
                                <span className="text-gray-400 flex-shrink-0">{count}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                    style={{ width: `${(count / totalReports) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsView;
