import {Command, defaultResponse} from '../domain/command';
import {CFToolsServer, CommandConfig} from '../domain/cftools';
import {CFToolsClient, LeaderboardItem, ServerApiId, Statistic} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';
import {translate} from '../translations';

interface Config extends CommandConfig {
    allowedStats: (keyof typeof statMapping)[],
    defaultStat: keyof typeof statMapping
}

interface Mapping {
    requestStatistic: Statistic,
    metricKey: string,
}

const statMapping: { [key: string]: Mapping } = {
    kills: {
        requestStatistic: Statistic.KILLS,
        metricKey: 'LEADERBOARD_KILLS',
    },
    deaths: {
        requestStatistic: Statistic.DEATHS,
        metricKey: 'LEADERBOARD_DEATHS',
    },
    suicides: {
        requestStatistic: Statistic.SUICIDES,
        metricKey: 'LEADERBOARD_SUICIDES',
    },
    playtime: {
        requestStatistic: Statistic.PLAYTIME,
        metricKey: 'LEADERBOARD_PLAYTIME',
    },
    longest_kill: {
        requestStatistic: Statistic.LONGEST_KILL,
        metricKey: 'LEADERBOARD_LONGEST_KILL',
    },
    longest_shot: {
        requestStatistic: Statistic.LONGEST_SHOT,
        metricKey: 'LEADERBOARD_LONGEST_SHOT',
    },
    kdratio: {
        requestStatistic: Statistic.KILL_DEATH_RATIO,
        metricKey: 'LEADERBOARD_KILL_DEATH_RATIO',
    },
}

/**
 * Shamelessly "borrowed" from StackOverflow, user powtac:
 * https://stackoverflow.com/a/6313008/3394281
 */
function secondsToHours(s: number) {
    let hours = Math.floor(s / 3600);
    let minutes = Math.floor((s - (hours * 3600)) / 60);
    let seconds = s - (hours * 3600) - (minutes * 60);

    let result = '';
    if (hours < 10) {
        result += '0';
    }
    result += hours + ':';
    if (minutes < 10) {
        result += '0';
    }
    result += minutes + ':';
    if (seconds < 10) {
        result += '0';
    }
    return result + seconds + 'h';
}

function renderKillDeath(items: LeaderboardItem[], message: MessageEmbed): MessageEmbed {
    for (let item of items) {
        message.addField(item.rank, item.name, true)
            .addField(translate('LEADERBOARD_KILLS'), item.kills, true)
            .addField(translate('LEADERBOARD_DEATHS'), item.deaths, true);
    }
    return message;
}

function renderSingle(
    items: LeaderboardItem[],
    message: MessageEmbed,
    titleKey: string,
    itemKey: keyof LeaderboardItem | ((item: LeaderboardItem) => string),
): MessageEmbed {
    let valueFn;
    if (typeof itemKey === 'string') {
        valueFn = (item: LeaderboardItem) => item[itemKey] as string
    } else {
        valueFn = itemKey;
    }
    for (let item of items) {
        message.addField(item.rank, item.name, true)
            .addField('\u200b', '\u200b', true)
            .addField(translate(titleKey), valueFn(item), true);
    }
    return message;
}

export class Leaderboard implements Command {
    public static readonly COMMAND = 'leaderboard';

    constructor(private readonly server: CFToolsServer, private readonly parameters: string[], private readonly config: Config) {
    }

    async execute(client: CFToolsClient): Promise<string | MessageEmbed> {
        const stat = this.resolveCommand();
        if (typeof stat === 'string') {
            return stat;
        }
        const response = await client.getLeaderboard({
            serverApiId: ServerApiId.of(this.server.serverApiId),
            order: 'ASC',
            statistic: stat.requestStatistic,
            limit: 7,
        });

        const message = defaultResponse()
            .setColor('BLUE')
            .setTitle(translate('LEADERBOARD_TITLE', {
                params: {
                    server: this.server.name,
                    metric: translate(stat.metricKey)
                }
            }));

        if (response.length === 0) {
            message.addField(translate('LEADERBOARD_EMPTY_TITLE'), translate('LEADERBOARD_EMPTY_BODY'));
            return message;
        } else {
            return this.renderLeaderboard(stat, response, message);
        }
    }

    private renderLeaderboard(stat: Mapping, response: LeaderboardItem[], message: MessageEmbed): MessageEmbed {
        switch (stat.requestStatistic) {
            case Statistic.KILLS:
            case Statistic.DEATHS:
                return renderKillDeath(response, message);
            case Statistic.SUICIDES:
                return renderSingle(response, message, 'LEADERBOARD_SUICIDES', 'suicides');
            case Statistic.PLAYTIME:
                return renderSingle(response, message, 'LEADERBOARD_PLAYTIME', (item: LeaderboardItem) => secondsToHours(item.playtime));
            case Statistic.KILL_DEATH_RATIO:
                return renderSingle(response, message, 'LEADERBOARD_KD_RATIO', 'killDeathRation');
            case Statistic.LONGEST_KILL:
                return renderSingle(response, message, 'LEADERBOARD_LONGEST_KILL', (item: LeaderboardItem) => item.longestKill + 'm');
            case Statistic.LONGEST_SHOT:
                return renderSingle(response, message, 'LEADERBOARD_LONGEST_SHOT', (item: LeaderboardItem) => item.longestShot + 'm');
            default:
                throw Error('Can not render unknown requested statistic.');
        }
    }

    private resolveCommand(): Mapping | string {
        let statCandidate = 'kills';
        if (this.parameters.length === 1) {
            statCandidate = this.parameters[0];
        }
        let key: string | undefined = undefined;
        if (!statMapping.hasOwnProperty(statCandidate)) {
            key = 'LEADERBOARD_STAT_NOT_KNOWN';
        } else if (!this.config.allowedStats.includes(statCandidate)) {
            key = 'LEADERBOARD_STAT_NOT_ALLOWED';
        }
        if (key !== undefined) {
            return translate(key, {
                params: {
                    allowedStats: this.config.allowedStats.join(', '),
                }
            });
        }
        return statMapping[statCandidate];
    }
}
