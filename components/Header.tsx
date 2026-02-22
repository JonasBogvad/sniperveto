'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import PlatformIcon from '@/components/PlatformIcon';
import LoginModal from '@/components/LoginModal';
import { mockStreamers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/user-context';

const NAV_ROUTES = [
  { href: '/', label: 'DB' },
  { href: '/report', label: 'Report' },
  { href: '/stats', label: 'Stats' },
] as const;

const Header = () => {
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  const isVerified =
    (user?.type === 'streamer' && user.verified) ||
    (user?.type === 'mod' && mockStreamers[user.streamerName ?? '']?.verified);

  return (
    <>
      <header className="border-b border-white/10 bg-black/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">SniperVeto</h1>
                <p className="text-xs text-gray-400">Stream Sniper Database</p>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {NAV_ROUTES.map(({ href, label }) => {
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
                        : 'text-gray-400 hover:text-white hover:bg-transparent'
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
                    <PlatformIcon platform={user.platform} />
                    <span className="text-xs sm:text-sm font-medium max-w-16 sm:max-w-none truncate">
                      {user.name}
                    </span>
                    {isVerified && (
                      <span className="text-blue-400 text-xs" title="Verified - 2x vote weight">
                        V
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUser(null)}
                    className="text-gray-400 hover:text-white text-xs sm:text-sm px-2 h-auto"
                  >
                    <span className="sm:hidden">X</span>
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                >
                  Login
                </Button>
              )}
            </div>

          </div>
        </div>
      </header>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={setUser}
      />
    </>
  );
};

export default Header;
