'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import PlatformIcon from '@/components/PlatformIcon';
import { Button } from '@/components/ui/button';

const BASE_NAV = [
  { href: '/', label: 'DB' },
  { href: '/report', label: 'Report' },
  { href: '/stats', label: 'Stats' },
] as const;

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="border-b border-white/10 bg-black/30 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="SniperVeto"
              width={621}
              height={190}
              className="h-10 w-auto sm:h-12"
              priority
              unoptimized
            />
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              ...BASE_NAV,
              ...(user && ['MOD', 'STREAMER', 'ADMIN'].includes(user.role)
                ? [{ href: '/appeals', label: 'Appeals' }]
                : []),
              ...(user && user.role === 'STREAMER'
                ? [{ href: '/my/mods', label: 'My Mods' }]
                : []),
              ...(user && user.role === 'ADMIN'
                ? [{ href: '/admin', label: 'Admin' }]
                : []),
            ].map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Button
                  key={href}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`text-xs sm:text-sm px-2 py-1 h-auto ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-sv-text-2 hover:text-sv-text hover:bg-transparent'
                  }`}
                >
                  <Link href={href}>{label}</Link>
                </Button>
              );
            })}
          </nav>

          {/* Auth */}
          <div>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2 py-1 sm:px-3 sm:py-1.5">
                  {user.image && user.platform !== 'kick' ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? ''}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <PlatformIcon platform={user.platform} />
                  )}
                  <span className="text-xs sm:text-sm font-medium max-w-16 sm:max-w-none truncate">
                    {user.username ?? user.name}
                  </span>
                  {user.role !== 'USER' && (
                    <span className="text-blue-400 text-xs font-bold" title={user.role}>
                      {user.role === 'MOD' ? 'M' : user.role === 'STREAMER' ? 'S' : user.role[0]}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void signOut()}
                  className="text-sv-text-2 hover:text-sv-text text-xs sm:text-sm px-2 h-auto"
                >
                  <span className="sm:hidden">X</span>
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void signIn('twitch')}
                  className="bg-white/10 hover:bg-white/20 px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm flex items-center gap-1.5 text-sv-text"
                >
                  <PlatformIcon platform="twitch" size={13} />
                  <span className="hidden sm:inline">Twitch</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void signIn('kick')}
                  className="bg-white/10 hover:bg-white/20 px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm flex items-center gap-1.5 text-sv-text"
                >
                  <PlatformIcon platform="kick" size={13} />
                  <span className="hidden sm:inline">Kick</span>
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
