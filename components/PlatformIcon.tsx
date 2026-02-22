import type { Platform } from '@/types';

// Update paths here when brand logos change.
// Official SVGs from https://simpleicons.org
const ICONS = {
  twitch:  'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z',
  youtube: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z',
  kick:    'M2 2h4v6.5L11.5 2H18l-7 8 7 8h-7.5L6 11.5V18H2V2z',
};

const COLORS: Record<string, string> = {
  twitch:  'text-purple-400',
  youtube: 'text-red-500',
  kick:    'text-green-400',
};

interface PlatformIconProps {
  platform: Platform | string;
  size?: number;
}

const PlatformIcon = ({ platform, size = 16 }: PlatformIconProps) => {
  const path = ICONS[platform as keyof typeof ICONS];
  if (!path) return null;

  return (
    <span className={COLORS[platform] ?? 'text-white'}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label={platform}>
        <path d={path} />
      </svg>
    </span>
  );
};

export default PlatformIcon;
