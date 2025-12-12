// Mock data for development - will be replaced with API calls

export const mockStreamers = {
    'Shroud': { platform: 'twitch', mods: ['ModAndy', 'NightBot_Human', 'ShroudMod1'], verified: true },
    'xQc': { platform: 'kick', mods: ['xQcMod', 'JuicerHelper'], verified: true },
    'summit1g': { platform: 'twitch', mods: ['summit_mod', 'MountainMan'], verified: false },
    'DrDisrespect': { platform: 'youtube', mods: ['ChampionClub_Mod'], verified: true },
};

export const mockReports = [
    {
        id: 1,
        steamId: '76561198012345678',
        steamName: 'xX_Sniper_Xx',
        reportedBy: 'Shroud',
        submittedBy: 'ModAndy',
        platform: 'twitch',
        game: 'PUBG',
        date: '2025-11-20',
        description: 'Followed me across 3 different matches, always landed at the same location within seconds of me showing it on stream.',
        proofLinks: ['https://clips.twitch.tv/example1', 'https://imgur.com/abc123'],
        reportCount: 12,
        severity: 'high',
        votes: { total: 8, voters: ['Shroud', 'xQc', 'summit1g'] }
    },
    {
        id: 2,
        steamId: '76561198087654321',
        steamName: 'TotallyNotWatching',
        reportedBy: 'xQc',
        submittedBy: null,
        platform: 'kick',
        game: 'Rust',
        date: '2025-11-19',
        description: 'Showed up at my base within 2 minutes of me revealing the location. Has done this 5+ times.',
        proofLinks: ['https://youtube.com/watch?v=example'],
        reportCount: 8,
        severity: 'high',
        votes: { total: 5, voters: ['xQc', 'DrDisrespect'] }
    },
    {
        id: 3,
        steamId: '76561198011111111',
        steamName: 'LuckyGamer42',
        reportedBy: 'summit1g',
        submittedBy: 'summit_mod',
        platform: 'twitch',
        game: 'Escape from Tarkov',
        date: '2025-11-18',
        description: 'Suspicious timing on extracts, always waiting at the exact extract I choose.',
        proofLinks: ['https://clips.twitch.tv/example2'],
        reportCount: 3,
        severity: 'medium',
        votes: { total: 2, voters: ['summit1g', 'ModAndy'] }
    },
    {
        id: 4,
        steamId: '76561198099999999',
        steamName: 'JustACoincidence',
        reportedBy: 'DrDisrespect',
        submittedBy: null,
        platform: 'youtube',
        game: 'Call of Duty: Warzone',
        date: '2025-11-17',
        description: 'Pre-aimed my position multiple times despite no intel.',
        proofLinks: [],
        reportCount: 1,
        severity: 'low',
        votes: { total: 0, voters: [] }
    }
];
