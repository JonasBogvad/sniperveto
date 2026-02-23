'use client';

import { useState } from 'react';
import PlatformIcon from '@/components/PlatformIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppUser, ReportFormData } from '@/types';

interface ReportFormProps {
  user: AppUser | null;
  onSubmit: (data: ReportFormData) => Promise<void> | void;
  initialSteamId?: string;
  initialSteamName?: string;
  games: string[];
}

const ReportForm = ({ user, onSubmit, initialSteamId, initialSteamName, games }: ReportFormProps) => {
  const [formData, setFormData] = useState<ReportFormData>({
    steamId: initialSteamId ?? '',
    steamName: initialSteamName ?? '',
    game: '',
    description: '',
    proofLinks: [''],
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupAvatar, setLookupAvatar] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleSteamLookup = async () => {
    if (!formData.steamId.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupAvatar(null);
    try {
      const res = await fetch(`/api/steam/lookup?steamId=${encodeURIComponent(formData.steamId.trim())}`);
      if (!res.ok) {
        setLookupError('Profile not found');
        return;
      }
      const data = (await res.json()) as { steamName: string; avatarUrl: string };
      setFormData((prev) => ({ ...prev, steamName: data.steamName }));
      setLookupAvatar(data.avatarUrl);
    } catch {
      setLookupError('Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ steamId: '', steamName: '', game: '', description: '', proofLinks: [''] });
    }, 3000);
  };

  const addProofLink = () => {
    setFormData({ ...formData, proofLinks: [...formData.proofLinks, ''] });
  };

  const updateProofLink = (index: number, value: string) => {
    const newLinks = [...formData.proofLinks];
    newLinks[index] = value;
    setFormData({ ...formData, proofLinks: newLinks });
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl">
          *
        </div>
        <h2 className="text-lg sm:text-xl font-bold mb-2">Login Required</h2>
        <p className="text-gray-400 text-sm">Connect your Twitch account to submit reports</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl">
          OK
        </div>
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
          <div>
            <label className="block text-sm font-medium mb-1">Steam ID *</label>
            <div className="flex gap-2">
              <Input
                type="text"
                required
                placeholder="76561198..."
                value={formData.steamId}
                onChange={(e) => {
                  setFormData({ ...formData, steamId: e.target.value });
                  setLookupAvatar(null);
                  setLookupError(null);
                }}
                className="bg-white/5 border-white/10 text-white flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSteamLookup}
                disabled={lookupLoading || !formData.steamId.trim()}
                className="bg-white/10 hover:bg-white/20 text-sv-text-2 text-xs shrink-0"
              >
                {lookupLoading ? '...' : 'Lookup'}
              </Button>
            </div>
            {lookupError && <p className="text-xs text-sv-danger mt-1">{lookupError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Steam Name</label>
            <div className="flex items-center gap-2">
              {lookupAvatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lookupAvatar} alt="" className="w-7 h-7 rounded" />
              )}
              <Input
                type="text"
                placeholder="Display name"
                value={formData.steamName}
                onChange={(e) => setFormData({ ...formData, steamName: e.target.value })}
                className="bg-white/5 border-white/10 text-white flex-1"
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
                {games.map((game) => (
                  <SelectItem
                    key={game}
                    value={game}
                    className="text-white focus:bg-white/10 focus:text-white"
                  >
                    {game}
                  </SelectItem>
                ))}
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
              <span className="truncate">
                As <strong className="text-white">{user.username ?? user.name}</strong>
              </span>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 py-2.5 sm:py-3 font-bold text-sm sm:text-base"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
