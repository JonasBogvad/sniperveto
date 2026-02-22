interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  avatarmedium: string;
  profileurl: string;
}

/**
 * Looks up a Steam profile by 64-bit Steam ID.
 * Requires STEAM_API_KEY env var. Returns null if key is missing or lookup fails.
 */
export async function lookupSteamProfile(
  steamId: string,
): Promise<SteamPlayerSummary | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${encodeURIComponent(steamId)}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!res.ok) return null;
    const json = (await res.json()) as {
      response: { players: SteamPlayerSummary[] };
    };
    return json.response.players[0] ?? null;
  } catch (err) {
    console.error('[steam] lookupSteamProfile error:', err);
    return null;
  }
}
