import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — SniperVeto' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-sv-text">
      <div>
        <h1 className="text-2xl font-bold mb-1">Privacy Policy</h1>
        <p className="text-sv-text-3 text-sm">Last updated: February 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What SniperVeto is</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          SniperVeto is a community-driven database where streamers and their moderators can
          report Steam accounts suspected of stream sniping. Reports are public and visible to
          anyone who visits the site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Data we collect</h2>
        <div className="space-y-4 text-sm text-sv-text-2 leading-relaxed">
          <div>
            <p className="font-medium text-sv-text mb-1">When you log in with Twitch or Kick</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your platform username and display name</li>
              <li>Your profile avatar</li>
              <li>Your email address (optional — only if your provider shares it)</li>
              <li>Your platform account ID (used to identify your account)</li>
              <li>For Twitch: the list of channels you moderate (to verify your mod status)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-sv-text mb-1">When you submit a report</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>The Steam ID and name you provide</li>
              <li>The game, description, and evidence links you submit</li>
              <li>Your username as the reporter (shown publicly)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-sv-text mb-1">When you look up a Steam profile</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>The Steam ID is sent to the Steam Web API to retrieve the public profile name and avatar</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What we do NOT collect</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-sv-text-2 ml-2">
          <li>IP addresses</li>
          <li>Browsing history or tracking cookies</li>
          <li>Payment information</li>
          <li>Any data from users who are not logged in</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">How we use your data</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-sv-text-2 ml-2">
          <li>To identify you as a logged-in user</li>
          <li>To attribute reports and votes to your account</li>
          <li>To verify your moderator status with the platform API</li>
          <li>To display your username and avatar in the UI</li>
        </ul>
        <p className="text-sm text-sv-text-2 leading-relaxed">
          We do not sell your data. We do not use it for advertising. We do not share it with
          third parties except as required to operate the service (database hosting via Neon,
          deployment via Vercel).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Public data</h2>
        <p className="text-sm text-sv-text-2 leading-relaxed">
          Reports are public by design — that is the purpose of the service. Your username will
          appear on any report you submit. If you submit a report, treat it as public and
          long-lived. You may request removal of your own reports by contacting us, but we cannot
          guarantee removal in all cases.
        </p>
        <p className="text-sm text-sv-text-2 leading-relaxed">
          The Steam account data we store (Steam ID, display name, and avatar) is already publicly
          available via Steam&apos;s own platform and API. We do not collect or store any private
          Steam data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Data retention and deletion</h2>
        <p className="text-sm text-sv-text-2 leading-relaxed">
          Your account data is retained as long as your account exists. To request deletion of
          your account or any reports you submitted, contact us. Reports about a Steam account
          may be retained even after the reporter's account is deleted, as they form part of
          the community evidence record.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Third-party services</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-sv-text-2 ml-2">
          <li><strong className="text-sv-text">Twitch / Kick OAuth</strong> — used for login. Their privacy policies apply to the OAuth flow.</li>
          <li><strong className="text-sv-text">Steam Web API</strong> — used to look up public Steam profiles.</li>
          <li><strong className="text-sv-text">Neon</strong> — PostgreSQL database hosting.</li>
          <li><strong className="text-sv-text">Vercel</strong> — application hosting and deployment.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-sm text-sv-text-2">
          Questions or data deletion requests: open an issue at{' '}
          <a
            href="https://github.com/JonasBogvad/sniperveto"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sv-text-2 hover:text-sv-text transition-colors"
          >
            github.com/JonasBogvad/sniperveto
          </a>
        </p>
      </section>
    </div>
  );
}
