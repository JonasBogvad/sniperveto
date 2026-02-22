import type { Platform } from '@/types';

interface PlatformIconProps {
  platform: Platform | string;
  size?: number;
}

const TwitchIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Twitch">
    <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2 3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z" />
  </svg>
);

const YouTubeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="YouTube">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z" />
  </svg>
);

const KickIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Kick">
    <path d="M2 2h4v6.5L11.5 2H18l-7 8 7 8h-7.5L6 11.5V18H2V2z" />
  </svg>
);

const PlatformIcon = ({ platform, size = 16 }: PlatformIconProps) => {
  if (platform === 'twitch')
    return <span className="text-purple-400"><TwitchIcon size={size} /></span>;
  if (platform === 'youtube')
    return <span className="text-red-500"><YouTubeIcon size={size} /></span>;
  if (platform === 'kick')
    return <span className="text-green-400"><KickIcon size={size} /></span>;
  return null;
};

export default PlatformIcon;
