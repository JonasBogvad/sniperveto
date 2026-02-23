'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';
import ReportForm from '@/components/ReportForm';
import { useUser } from '@/lib/user-context';
import type { ReportFormData } from '@/types';

function ReportPageInner({ games }: { games: string[] }) {
  const { user } = useUser();
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSteamId = searchParams.get('steamId') ?? undefined;
  const initialSteamName = searchParams.get('steamName') ?? undefined;

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

  return (
    <ReportForm
      user={user}
      onSubmit={handleSubmit}
      initialSteamId={initialSteamId}
      initialSteamName={initialSteamName}
      games={games}
    />
  );
}

export default function ReportPageClient({ games }: { games: string[] }) {
  return (
    <Suspense>
      <ReportPageInner games={games} />
    </Suspense>
  );
}
