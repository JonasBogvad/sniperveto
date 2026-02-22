'use client';

import { useRouter } from 'next/navigation';
import ReportForm from '@/components/ReportForm';
import { useUser } from '@/lib/user-context';
import type { ReportFormData } from '@/types';

export default function ReportPage() {
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (formData: ReportFormData) => {
    if (!user) return;

    const reportedBy =
      user.type === 'mod'
        ? { username: user.streamerName ?? user.name, platform: user.platform }
        : { username: user.name, platform: user.platform };

    const submittedBy =
      user.type === 'mod' ? { username: user.name, platform: user.platform } : undefined;

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        steamId: formData.steamId,
        steamName: formData.steamName,
        game: formData.game,
        platform: user.platform,
        description: formData.description,
        proofLinks: formData.proofLinks.filter((l) => l.trim() !== ''),
        severity: 'low',
        reportedBy,
        submittedBy,
      }),
    });

    if (res.ok) {
      router.push('/');
    }
  };

  return (
    <ReportForm user={user} onSubmit={handleSubmit} />
  );
}
