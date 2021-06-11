const messages: { [key: string]: string } = {
    PRIORITY_TITLE: 'Priority Queue information for {{id}}',
    NO_PRIORITY: 'You do not have priority queue for this server.',
    HAS_PRIORITY: 'You have priority queue for this server.',
    PRIORITY_EXPIRES: 'Expires',
    PRIORITY_EXPIRES_NEVER: 'Never',

    LEADERBOARD_STAT_NOT_ALLOWED: 'The requested statistic is disabled. Choose one of the allowed ones: {{allowedStats}}',
    LEADERBOARD_STAT_NOT_KNOWN: 'The requested statistic is not known. Choose one of the allowed ones: {{allowedStats}}',
    LEADERBOARD_TITLE: 'Top 10 {{metric}} on {{server}}',
    LEADERBOARD_KILLS: 'Kills',
    LEADERBOARD_DEATHS: 'Deaths',
    LEADERBOARD_SUICIDES: 'Suicides',
    LEADERBOARD_PLAYTIME: 'Playtime',
    LEADERBOARD_LONGEST_KILL: 'Longest kill',
    LEADERBOARD_LONGEST_SHOT: 'Longest shot',
    LEADERBOARD_KD_RATIO: 'Kill/Death ratio',
    LEADERBOARD_EMPTY_TITLE: 'No entries in leaderboard',
    LEADERBOARD_EMPTY_BODY: 'There was no data for the given statistic on that server.',

    DETAILS_TITLE: 'Game server details for {{serverName}}',
    DETAILS_SERVER_NAME: ':name_badge: Server name',
    DETAILS_MAP: ':map: Map',
    DETAILS_PLAYERS: ':walking: Players (+Queued)',
    DETAILS_TIME: ':clock3: Time',
    DETAILS_ERROR_SERVER_NOT_FOUND: 'The server does not exist in CFTools Cloud. This is most likely an error int he configuration of this bot.',

    STEAM_ID_UNKNOWN: 'The provided Steam ID is unknown.',
    ERROR_UNKNOWN_SERVER: 'The server identifier you provided is unknown.',
    ERROR_UNKNOWN_COMMAND: 'The used command is unknown.',
    ERROR_UNKNOWN: 'An unknown error occurred :woozy_face:',
};

interface TranslateOptions {
    params?: { [key: string]: string }
}

export function translate(key: string, options?: TranslateOptions): string {
    let message = messages[key];
    if (message === undefined) {
        return key;
    }
    if (options?.params !== undefined) {
        for (const param in options.params) {
            message = message.replace(`{{${param}}}`, options.params[param]);
        }
    }
    return message;
}
