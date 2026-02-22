import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About — SniperVeto' };

export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6 text-sv-text">
      <h1 className="text-2xl font-bold">About</h1>

      <p className="text-sv-text-2 text-sm leading-relaxed">
        SniperVeto is a community-run database that helps streamers and their moderators keep
        track of Steam accounts with a history of stream sniping. Reports are community-submitted
        and publicly visible.
      </p>

      <p className="text-sv-text-2 text-sm leading-relaxed">
        The goal is simple — give streamers and their communities a shared, searchable record.
        Nothing more, nothing less.
      </p>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">Been reported?</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          Reports are community-submitted and represent the opinion of the person who filed
          them — they are not verified facts or official bans. If you believe a report about
          your Steam account is incorrect, you can file an appeal directly on the report page.
          We review all appeals.
        </p>
      </div>

      <div className="pt-2 border-t border-white/10 space-y-1">
        <p className="text-sm text-sv-text-2">
          Built by{' '}
          <a
            href="https://www.linkedin.com/in/jonasbogvad/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sv-text hover:text-sv-text-2 transition-colors"
          >
            Jonas Bøgvad
          </a>
        </p>
        <p className="text-xs text-sv-text-3">
          Questions or concerns? Open an issue on{' '}
          <a
            href="https://github.com/JonasBogvad/sniperveto"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sv-text-2 transition-colors"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
