interface DiscordAppealPayload {
  reportId: string;
  steamId: string;
  steamName: string;
  reason: string;
  contact?: string | null;
}

export async function notifyDiscordNewAppeal(appeal: DiscordAppealPayload): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const fields = [
    { name: 'Steam ID',   value: appeal.steamId,   inline: true },
    { name: 'Steam Name', value: appeal.steamName,  inline: true },
    { name: 'Report ID',  value: appeal.reportId,   inline: false },
    { name: 'Reason',     value: appeal.reason.slice(0, 1024) },
  ];
  if (appeal.contact) fields.push({ name: 'Contact', value: appeal.contact, inline: false });

  const body = {
    embeds: [{
      title: `New Appeal: ${appeal.steamName}`,
      url: `https://sniperveto.vercel.app/appeals`,
      color: 0x3b82f6,
      fields,
      footer: { text: 'SniperVeto' },
      timestamp: new Date().toISOString(),
    }],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[discord] appeal webhook error:', err);
  }
}

interface DiscordReportPayload {
  id: string;
  steamName: string;
  steamId: string;
  reportedBy: string;
  game: string;
  severity: string;
  description: string;
}

const SEVERITY_COLORS: Record<string, number> = {
  low:    0xf59e0b, // amber
  medium: 0xf97316, // orange
  high:   0xdc2626, // red
};

/**
 * Sends a Discord embed when a new report is created.
 * Requires DISCORD_WEBHOOK_URL env var. Silently no-ops if missing.
 */
export async function notifyDiscordNewReport(report: DiscordReportPayload): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const color = SEVERITY_COLORS[report.severity.toLowerCase()] ?? SEVERITY_COLORS.high;

  const body = {
    embeds: [
      {
        title: `New Report: ${report.steamName}`,
        url: `https://sniperveto.vercel.app`,
        color,
        fields: [
          { name: 'Steam ID',    value: report.steamId,    inline: true },
          { name: 'Game',        value: report.game,        inline: true },
          { name: 'Severity',    value: report.severity.toUpperCase(), inline: true },
          { name: 'Reported by', value: report.reportedBy,  inline: true },
          { name: 'Description', value: report.description.slice(0, 1024) },
        ],
        footer: { text: 'SniperVeto' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[discord] webhook error:', err);
  }
}
