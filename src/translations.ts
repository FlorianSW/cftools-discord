const messages: { [key: string]: string } = {
    RESPONSE_LOADING_0: 'Crunching data...',
    RESPONSE_LOADING_1: 'Please hold the line...',
    RESPONSE_LOADING_2: 'Glueing data together...',
    RESPONSE_LOADING_3: 'Release the Kraken! jk, please wait...',

    HASPRIORITY_COMMAND_DESCRIPTION: 'Checks if the provided steam ID skips the queue (having priority queue) on the server.',
    HASPRIORITY_COMMAND_USAGE: '{{mapping}} <Player-Steam-ID>',
    PRIORITY_TITLE: 'Priority Queue information for {{id}}',
    NO_PRIORITY: 'You do not have priority queue for this server.',
    HAS_PRIORITY: 'You have priority queue for this server.',
    PRIORITY_EXPIRES: 'Expires',
    PRIORITY_EXPIRES_NEVER: 'Never',
    PRIORITY_NOT_CONFIGURED: 'The server has no priority queue configured.',

    LEADERBOARD_COMMAND_DESCRIPTION: 'Calculates a leaderboard for the provided statistic.',
    LEADERBOARD_COMMAND_USAGE: '{{mapping}} [<statistic>]',
    LEADERBOARD_STAT_NOT_ALLOWED: 'The requested statistic is disabled. Choose one of the allowed ones: {{allowedStats}}',
    LEADERBOARD_STAT_NOT_KNOWN: 'The requested statistic is not known. Choose one of the allowed ones: {{allowedStats}}',
    LEADERBOARD_TITLE: 'Top 7 {{metric}} on {{server}}',
    LEADERBOARD_KILLS: 'Kills',
    LEADERBOARD_DEATHS: 'Deaths',
    LEADERBOARD_SUICIDES: 'Suicides',
    LEADERBOARD_PLAYTIME: 'Playtime',
    LEADERBOARD_LONGEST_KILL: 'Longest kill',
    LEADERBOARD_LONGEST_SHOT: 'Longest shot',
    LEADERBOARD_KD_RATIO: 'Kill/Death ratio',
    LEADERBOARD_EMPTY_TITLE: 'No entries in leaderboard',
    LEADERBOARD_EMPTY_BODY: 'There was no data for the given statistic on that server.',

    DETAILS_COMMAND_DESCRIPTION: 'Displays details about the game server, like how many players are currently online and what time it is in-game.',
    DETAILS_COMMAND_USAGE: '{{mapping}}',
    DETAILS_TITLE: 'Game server details for {{serverName}}',
    DETAILS_SERVER_NAME: ':name_badge: Server name',
    DETAILS_MAP: ':map: Map',
    DETAILS_PLAYERS: ':walking: Players (+Queued)',
    DETAILS_TIME: ':clock3: Time',
    DETAILS_ERROR_SERVER_NOT_FOUND: 'The server does not exist in CFTools Cloud. This is most likely an error int he configuration of this bot.',
    DETAILS_QUERY_ERROR: 'The server currently has troubles responding with information. Please try again later.',

    PLAYERSTATS_COMMAND_DESCRIPTION: 'Prints interesting statistics of a player, like playtime or the longest shot.',
    PLAYERSTATS_COMMAND_USAGE: '{{mapping}} <Player-Steam-ID>',
    PLAYERSTATS_NAME: 'Player statistics for {{playerName}}',
    PLAYERSTATS_PLAYTIME: 'Playtime',
    PLAYERSTATS_KILLS: 'Kills',
    PLAYERSTATS_DEATHS: 'Deaths',
    PLAYERSTATS_LONGEST_KILL: 'Longest kill',
    PLAYERSTATS_WEAPON_MOST_KILLS: 'Favorite weapon',

    HELP_COMMAND_DESCRIPTION: 'Shows this help message. See the below list of available commands and see the help page of an individual command by executing the `help <command>` command.',
    HELP_COMMAND_USAGE: '{{mapping}} <command>',
    HELP_COMMAND_NOT_FOUND: 'The command was not found. Use `help` to show available commands.',
    HELP_TITLE: 'CFTools Discord help',
    HELP_DESCRIPTION: 'Description',
    HELP_USAGE: 'Usage',
    HELP_AVAILABLE_COMMANDS: 'Available commands',

    STEAM_ID_UNKNOWN: 'The provided Steam ID is unknown.',
    ERROR_UNKNOWN_SERVER: 'The server identifier you provided is unknown.',
    ERROR_UNKNOWN_COMMAND: 'The used command is unknown.',
    ERROR_UNKNOWN: 'An unknown error occurred :woozy_face:',
    ERROR_STEAM_ID_REQUIRED: 'You need to specify your Steam ID.',
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
