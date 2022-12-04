const messages: { [key: string]: string } = {
    RESPONSE_LOADING_0: 'Crunching data...',
    RESPONSE_LOADING_1: 'Please hold the line...',
    RESPONSE_LOADING_2: 'Glueing data together...',
    RESPONSE_LOADING_3: 'Release the Kraken! jk, please wait...',

    CMD_OPTIONS_SERVER_TITLE: 'server',
    CMD_OPTIONS_SERVER_DESCRIPTION: 'Select the server to execute this command for',

    HASPRIORITY_COMMAND_DESCRIPTION: 'Checks if the provided steam ID skips the queue (having priority queue) on the server.',
    HASPRIORITY_STEAM_ID_DESCRIPTION: 'The Steam ID of the player check for priority queue',
    PRIORITY_TITLE: 'Priority Queue information for {{id}}',
    NO_PRIORITY: 'You do not have priority queue for this server.',
    HAS_PRIORITY: 'You have priority queue for this server.',
    PRIORITY_EXPIRES: 'Expires',
    PRIORITY_EXPIRES_NEVER: 'Never',
    PRIORITY_NOT_CONFIGURED: 'The server has no priority queue configured.',

    LEADERBOARD_COMMAND_DESCRIPTION: 'Calculates a leaderboard for the provided statistic.',
    LEADERBOARD_STAT_DESCRIPTION: 'With what statistic the leaderboard should be calculated.',
    LEADERBOARD_STAT_NOT_ALLOWED: 'The requested statistic is disabled. Choose one of the allowed ones: {{allowedStats}}',
    LEADERBOARD_TITLE: 'Top {{amount}} {{metric}} on {{server}}',
    LEADERBOARD_RANK: 'Rank',
    LEADERBOARD_NAME: 'Name',
    LEADERBOARD_KILLS: 'Kills',
    LEADERBOARD_DEATHS: 'Deaths',
    LEADERBOARD_SUICIDES: 'Suicides',
    LEADERBOARD_PLAYTIME: 'Playtime',
    LEADERBOARD_LONGEST_KILL: 'Longest kill',
    LEADERBOARD_LONGEST_SHOT: 'Longest shot',
    LEADERBOARD_KD_RATIO: 'Kill/Death ratio',
    LEADERBOARD_EMPTY_TITLE: 'No entries in leaderboard',
    LEADERBOARD_EMPTY_BODY: 'There was no data for the given statistic on that server.',

    BANPLAYER_COMMAND_DESCRIPTION: 'Puts a player on a ban list, given they are not banned already.',
    BAN_PLAYER_ID_DESCRIPTION: 'The player identifier to ban. Select from the suggestions or use a Steam ID64 or an IPv4 address',
    BAN_BANLIST_DESCRIPTION: 'Select the banlist where the ban should be placed on',
    BAN_PLAYER_ID_REQUIRED: 'You need to specify a valid player ID to ban',
    BAN_BANLIST_REQUIRED: 'The banlist parameter is required',
    BAN_BANLIST_MISSING: 'The specified banlist does not exist for this server',
    BAN_SUCCESS: 'The player {{name}} was banned on {{banlist}} until {{expiration}}.',

    DETAILS_COMMAND_DESCRIPTION: 'Displays details about the game server.',
    DETAILS_COMMAND_USAGE: '{{mapping}}',
    DETAILS_TITLE: 'Game server details for {{serverName}}',
    DETAILS_SERVER_NAME: ':name_badge: Server name',
    DETAILS_MAP: ':map: Map',
    DETAILS_PLAYERS: ':walking: Players (+Queued)',
    DETAILS_TIME: ':clock3: Time',
    DETAILS_ERROR_SERVER_NOT_FOUND: 'The server does not exist in CFTools Cloud. This is most likely an error int he configuration of this bot.',
    DETAILS_QUERY_ERROR: 'The server currently has troubles responding with information. Please try again later.',

    PLAYERSTATS_COMMAND_DESCRIPTION: 'Prints interesting statistics of a player, like playtime or the longest shot.',
    PLAYERSTATS_STEAM_ID_DESCRIPTION: 'The Steam ID of the player to get statistics for',
    PLAYERSTATS_NAME: 'Player statistics for {{playerName}}',
    PLAYERSTATS_PLAYTIME: 'Playtime',
    PLAYERSTATS_KILLS: 'Kills',
    PLAYERSTATS_DEATHS: 'Deaths',
    PLAYERSTATS_LONGEST_KILL: 'Longest kill',
    PLAYERSTATS_WEAPON_MOST_KILLS: 'Favorite weapon',

    STEAM_ID_UNKNOWN: 'The provided Steam ID is unknown.',
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
