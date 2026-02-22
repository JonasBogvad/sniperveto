import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/lib/user-context';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'SniperVeto - Stream Sniper Database',
  description: 'Community-driven stream sniper reporting database for streamers and their moderators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <UserProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
            {children}
          </main>
          <footer className="border-t border-white/10 py-4 sm:py-6 mt-8 sm:mt-12">
            <p className="text-center text-gray-500 text-xs sm:text-sm px-4">
              SniperVeto — Community stream sniper database
            </p>
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}
