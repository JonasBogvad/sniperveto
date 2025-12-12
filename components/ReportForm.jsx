'use client';

import { useState } from 'react';
import PlatformIcon from '@/components/PlatformIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReportForm = ({ user, onSubmit }) => {
    const [formData, setFormData] = useState({
        steamId: '',
        steamName: '',
        game: '',
        description: '',
        proofLinks: ['']
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ steamId: '', steamName: '', game: '', description: '', proofLinks: [''] });
        }, 3000);
    };

    const addProofLink = () => {
        setFormData({ ...formData, proofLinks: [...formData.proofLinks, ''] });
    };

    const updateProofLink = (index, value) => {
        const newLinks = [...formData.proofLinks];
        newLinks[index] = value;
        setFormData({ ...formData, proofLinks: newLinks });
    };

    if (!user) {
        return (
            <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl">*</div>
                <h2 className="text-lg sm:text-xl font-bold mb-2">Login Required</h2>
                <p className="text-gray-400 text-sm">Connect your account to submit reports</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl">OK</div>
                <h2 className="text-lg sm:text-xl font-bold mb-2">Report Submitted!</h2>
                <p className="text-gray-400 text-sm">Added to the database</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4">
            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Report Stream Sniper</h2>
                <p className="text-gray-400 text-xs sm:text-sm">Help the community report snipers</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-white/10 rounded-xl p-4 sm:p-5">
                <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Steam ID *</label>
                            <Input
                                type="text"
                                required
                                placeholder="76561198..."
                                value={formData.steamId}
                                onChange={(e) => setFormData({ ...formData, steamId: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Steam Name</label>
                            <Input
                                type="text"
                                placeholder="Display name"
                                value={formData.steamName}
                                onChange={(e) => setFormData({ ...formData, steamName: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Game *</label>
                        <Select
                            value={formData.game}
                            onValueChange={(value) => setFormData({ ...formData, game: value })}
                            required
                        >
                            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select game..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/10">
                                <SelectItem value="PUBG" className="text-white focus:bg-white/10 focus:text-white">PUBG</SelectItem>
                                <SelectItem value="Rust" className="text-white focus:bg-white/10 focus:text-white">Rust</SelectItem>
                                <SelectItem value="Escape from Tarkov" className="text-white focus:bg-white/10 focus:text-white">Escape from Tarkov</SelectItem>
                                <SelectItem value="Call of Duty: Warzone" className="text-white focus:bg-white/10 focus:text-white">Warzone</SelectItem>
                                <SelectItem value="Fortnite" className="text-white focus:bg-white/10 focus:text-white">Fortnite</SelectItem>
                                <SelectItem value="Apex Legends" className="text-white focus:bg-white/10 focus:text-white">Apex Legends</SelectItem>
                                <SelectItem value="DayZ" className="text-white focus:bg-white/10 focus:text-white">DayZ</SelectItem>
                                <SelectItem value="Counter-Strike 2" className="text-white focus:bg-white/10 focus:text-white">CS2</SelectItem>
                                <SelectItem value="Other" className="text-white focus:bg-white/10 focus:text-white">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description *</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Describe what happened..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Evidence Links</label>
                        <div className="space-y-2">
                            {formData.proofLinks.map((link, index) => (
                                <Input
                                    key={index}
                                    type="url"
                                    placeholder="https://clips.twitch.tv/..."
                                    value={link}
                                    onChange={(e) => updateProofLink(index, e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={addProofLink}
                            className="mt-2 text-sm text-gray-400 hover:text-white p-0 h-auto"
                        >
                            + Add link
                        </Button>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-gray-400">
                            <PlatformIcon platform={user.platform} />
                            {user.type === 'mod' ? (
                                <span className="truncate">As <strong className="text-white">{user.name}</strong> for <strong className="text-white">{user.streamerName}</strong></span>
                            ) : (
                                <span className="truncate">As <strong className="text-white">{user.name}</strong></span>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 py-2.5 sm:py-3 font-bold text-sm sm:text-base"
                        >
                            Submit Report
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReportForm;
