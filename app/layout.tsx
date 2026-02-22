import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'SniperVeto - Stream Sniper Database',
  description: 'Community-driven stream sniper reporting database for streamers and their moderators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-sv-page text-sv-text">
        <SessionProviderWrapper>
          <Header />
          <main className="max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
            {children}
          </main>
          <footer className="border-t border-white/10 py-4 sm:py-6 mt-8 sm:mt-12">
            <div className="flex flex-col items-center gap-2 px-4">
              <p className="text-center text-sv-text-3 text-xs sm:text-sm">
                SniperVeto — Community stream sniper database
              </p>
              <div className="flex gap-4 text-xs text-sv-text-3">
                <Link href="/about" className="hover:text-sv-text-2 transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="hover:text-sv-text-2 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-sv-text-2 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </footer>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
