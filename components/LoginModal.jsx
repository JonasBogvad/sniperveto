'use client';

import { useState } from 'react';
import { mockStreamers } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LoginModal = ({ open, onClose, onLogin }) => {
    const [loginType, setLoginType] = useState('streamer');
    const [selectedStreamer, setSelectedStreamer] = useState('');
    const [modName, setModName] = useState('');

    const handleStreamerLogin = (platform) => {
        const isVerified = platform === 'twitch' || platform === 'kick';
        onLogin({
            type: 'streamer',
            name: 'YourChannel',
            platform,
            verified: isVerified,
            mods: []
        });
    };

    const handleModLogin = () => {
        if (!selectedStreamer || !modName) return;
        const streamer = mockStreamers[selectedStreamer];
        onLogin({
            type: 'mod',
            name: modName,
            streamerName: selectedStreamer,
            platform: streamer.platform
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-white/10 text-white sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {loginType === 'streamer' ? 'Connect your streaming account' : 'Login as a moderator'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Button
                        variant={loginType === 'streamer' ? 'secondary' : 'ghost'}
                        className="flex-1"
                        onClick={() => setLoginType('streamer')}
                    >
                        Streamer
                    </Button>
                    <Button
                        variant={loginType === 'mod' ? 'secondary' : 'ghost'}
                        className="flex-1"
                        onClick={() => setLoginType('mod')}
                    >
                        Mod
                    </Button>
                </div>

                {loginType === 'streamer' ? (
                    <div className="space-y-2">
                        <Button
                            onClick={() => handleStreamerLogin('twitch')}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            <span className="font-bold">T</span> Twitch
                        </Button>
                        <Button
                            onClick={() => handleStreamerLogin('youtube')}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            <span className="font-bold">YT</span> YouTube
                        </Button>
                        <Button
                            onClick={() => handleStreamerLogin('kick')}
                            className="w-full bg-green-500 hover:bg-green-600 text-black"
                        >
                            <span className="font-bold">K</span> Kick
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Streamer</label>
                            <Select value={selectedStreamer} onValueChange={setSelectedStreamer}>
                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select streamer..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10">
                                    {Object.entries(mockStreamers).map(([name, data]) => (
                                        <SelectItem key={name} value={name} className="text-white focus:bg-white/10 focus:text-white">
                                            {name} {data.verified ? '✓' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mod Name</label>
                            <Input
                                type="text"
                                placeholder="Your username"
                                value={modName}
                                onChange={(e) => setModName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <Button
                            onClick={handleModLogin}
                            disabled={!selectedStreamer || !modName}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Login as Mod
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                            Mod status verified via platform API
                        </p>
                    </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                    Demo mode - all logins simulated
                </p>
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;
