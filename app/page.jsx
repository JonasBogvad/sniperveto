'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import ReportCard from '@/components/ReportCard';
import ReportDetailModal from '@/components/ReportDetailModal';
import ReportForm from '@/components/ReportForm';
import StatsView from '@/components/StatsView';
import { mockStreamers, mockReports } from '@/data/mockData';

export default function Home() {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [currentView, setCurrentView] = useState('home');
    const [reports, setReports] = useState(mockReports);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGame, setFilterGame] = useState('');

    const handleLogin = (userData) => {
        setUser(userData);
        setShowLogin(false);
    };

    const handleNewReport = (formData) => {
        const newReport = {
            id: reports.length + 1,
            steamId: formData.steamId,
            steamName: formData.steamName || 'Unknown',
            reportedBy: user.type === 'mod' ? user.streamerName : user.name,
            submittedBy: user.type === 'mod' ? user.name : null,
            platform: user.platform,
            game: formData.game,
            date: new Date().toISOString().split('T')[0],
            description: formData.description,
            proofLinks: formData.proofLinks.filter(l => l),
            reportCount: 1,
            severity: 'low',
            votes: { total: 0, voters: [] }
        };
        setReports([newReport, ...reports]);
    };

    const handleVote = (reportId) => {
        if (!user) return;

        let weight = 1;
        if (user.type === 'streamer' && user.verified) {
            weight = 2;
        } else if (user.type === 'mod') {
            const streamer = mockStreamers[user.streamerName];
            if (streamer?.verified) weight = 2;
        }

        setReports(reports.map(r => {
            if (r.id === reportId && !r.votes.voters.includes(user.name)) {
                return {
                    ...r,
                    votes: {
                        total: r.votes.total + weight,
                        voters: [...r.votes.voters, user.name]
                    }
                };
            }
            return r;
        }));
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = searchQuery === '' ||
            report.steamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.steamId.includes(searchQuery) ||
            report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGame = filterGame === '' || report.game === filterGame;
        return matchesSearch && matchesGame;
    });

    const games = [...new Set(reports.map(r => r.game))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <Header
                user={user}
                onLogin={() => setShowLogin(true)}
                onLogout={() => setUser(null)}
                currentView={currentView}
                setCurrentView={setCurrentView}
            />

            <main className="max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
                {currentView === 'home' && (
                    <>
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold mb-1">Sniper Database</h2>
                            <p className="text-gray-400 text-xs sm:text-sm">Browse reported snipers</p>
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
                            <select
                                value={filterGame}
                                onChange={(e) => setFilterGame(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white"
                            >
                                <option value="">All Games</option>
                                {games.map(game => (
                                    <option key={game} value={game}>{game}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {filteredReports.map(report => (
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

                {currentView === 'report' && (
                    <ReportForm user={user} onSubmit={handleNewReport} />
                )}

                {currentView === 'stats' && (
                    <StatsView reports={reports} />
                )}
            </main>

            <footer className="border-t border-white/10 py-4 sm:py-6 mt-8 sm:mt-12">
                <p className="text-center text-gray-500 text-xs sm:text-sm px-4">SniperVeto Demo - Reports for demonstration only</p>
            </footer>

            <LoginModal
                open={showLogin}
                onClose={() => setShowLogin(false)}
                onLogin={handleLogin}
            />

            <ReportDetailModal
                report={selectedReport}
                open={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                user={user}
                onVote={handleVote}
            />
        </div>
    );
}
