import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service — SniperVeto' };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-sv-text">
      <div>
        <h1 className="text-2xl font-bold mb-1">Terms of Service</h1>
        <p className="text-sv-text-3 text-sm">Last updated: February 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. What SniperVeto is</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          SniperVeto is a community-driven database where streamers and their verified moderators
          can submit reports about Steam accounts suspected of stream sniping. By using SniperVeto
          you agree to these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Eligibility</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          You must have a valid Twitch or YouTube account to log in and submit reports. By logging
          in you confirm that you are authorised to use that account and that the information you
          provide is accurate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Submitting reports</h2>
        <div className="space-y-2 text-sm text-sv-text-2 leading-relaxed">
          <p>
            Reports are public and permanent. Before submitting a report you must have reasonable
            evidence that the Steam account engaged in stream sniping. You must not submit reports:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>based on false or fabricated evidence</li>
            <li>as retaliation, harassment, or for any reason unrelated to stream sniping</li>
            <li>for accounts you do not have a genuine reason to believe are snipers</li>
          </ul>
          <p>
            Abuse of the reporting system may result in your account being suspended or your
            reports being removed.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Moderator status</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          Moderator privileges are granted automatically based on your verified moderator status
          on Twitch, confirmed via the Twitch API at login. You may only submit reports on behalf
          of channels you currently moderate. Misrepresenting your moderator status is a violation
          of these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Content standards</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          All content you submit (descriptions, evidence links, usernames) must relate to stream
          sniping activity. Do not include personal information beyond what is necessary to
          identify the Steam account (e.g. no real names, home addresses, or unrelated private
          information). Evidence links must point to publicly accessible content such as VODs or
          clips.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Appealing a report</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          If a report has been submitted about your Steam account, you may submit an appeal via
          the report detail page. Appeals are reviewed by admins. Submitting false or misleading
          information in an appeal is a violation of these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Intellectual property</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          SniperVeto does not claim ownership of content you submit. You grant SniperVeto a
          non-exclusive licence to store and display that content as part of the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Disclaimer of warranties</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          SniperVeto is provided &ldquo;as is&rdquo; without any warranty. Reports represent the
          views of individual community members and are not verified facts. SniperVeto makes no
          guarantee about the accuracy, completeness, or timeliness of any report. Use the
          information at your own discretion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9. Limitation of liability</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          To the maximum extent permitted by law, SniperVeto and its operators are not liable for
          any damages arising from your use of the service, including but not limited to reliance
          on reports or loss of account access.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">10. Changes to these terms</h2>
        <p className="text-sv-text-2 text-sm leading-relaxed">
          We may update these terms at any time. Continued use of SniperVeto after changes are
          posted constitutes acceptance of the updated terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">11. Contact</h2>
        <p className="text-sm text-sv-text-2">
          Questions or concerns: open an issue at{' '}
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
