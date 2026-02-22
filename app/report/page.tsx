'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ReportForm from '@/components/ReportForm';
import { useUser } from '@/lib/user-context';
import type { ReportFormData } from '@/types';

export default function ReportPage() {
  const { user } = useUser();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (formData: ReportFormData) => {
    if (!session?.user) return;

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        steamId: formData.steamId,
        steamName: formData.steamName,
        game: formData.game,
        description: formData.description,
        proofLinks: formData.proofLinks.filter((l) => l.trim() !== ''),
        severity: 'low',
      }),
    });

    if (res.ok) {
      router.push('/');
    }
  };

  return <ReportForm user={user} onSubmit={handleSubmit} />;
}
