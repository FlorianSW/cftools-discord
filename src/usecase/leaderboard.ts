import {Command, ParameterDescription} from '../domain/command';
import {CFToolsServer, CommandConfig} from '../domain/cftools';
import {CFToolsClient, LeaderboardItem, ServerApiId, Statistic} from 'cftools-sdk';
import {translate} from '../translations';
import {secondsToHours} from '../seconds-to-hours';
import {EmbedBuilder} from 'discord.js';

const MAX_DISCORD_FIELD_SIZE = 1024;

interface Config extends CommandConfig {
    allowedStats: (keyof typeof statMapping)[],
    defaultStat: keyof typeof statMapping,
    numberOfPlayers: number,
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

function maxLength(items: LeaderboardItem[], label: string, valueFn: (item: LeaderboardItem) => string): number {
    const lengths = items.map((i) => valueFn(i).length);
    lengths.push(label.length);
    return lengths.sort((a, b) => b - a)[0];
}

function renderKillDeath(renderInline: boolean, items: LeaderboardItem[], message: EmbedBuilder): EmbedBuilder {
    const longestRank = maxLength(items, translate('LEADERBOARD_RANK'), (item) => item.rank.toString(10));
    const longestName = maxLength(items, translate('LEADERBOARD_NAME'), (item) => item.name);
    const longestKills = maxLength(items, translate('LEADERBOARD_KILLS'), (item) => item.kills.toString(10));
    const longestDeaths = maxLength(items, translate('LEADERBOARD_DEATHS'), (item) => item.deaths.toString(10));

    if (renderInline) {
        let text = '```' +
            translate('LEADERBOARD_RANK') + ' '.repeat(longestRank - translate('LEADERBOARD_RANK').length) + '\t' +
            translate('LEADERBOARD_NAME') + ' '.repeat(longestName - translate('LEADERBOARD_NAME').length) + '\t' +
            translate('LEADERBOARD_KILLS') + ' '.repeat(longestKills - translate('LEADERBOARD_KILLS').length) + '\t' +
            translate('LEADERBOARD_DEATHS') + ' '.repeat(longestDeaths - translate('LEADERBOARD_DEATHS').length) + '\n\n';
        for (let item of items) {
            const toAppend =
                ' '.repeat(longestRank - item.rank.toString(10).length) + item.rank + '\t' +
                item.name + ' '.repeat(longestName - item.name.length) + '\t' +
                item.kills + ' '.repeat(longestKills - item.kills.toString(10).length) + '\t' +
                item.deaths + ' '.repeat(longestDeaths - item.deaths.toString(10).length) + '\n';

            if (text.length + 6 + toAppend.length >= MAX_DISCORD_FIELD_SIZE) {
                text += '...';
                break;
            }
            text += toAppend;
        }
        text += '```';
        message.addFields([{name: '\u200b', value: text}]);
    } else {
        for (let item of items) {
            message.addFields([
                {name: item.rank.toString(10), value: item.name, inline: true},
                {name: translate('LEADERBOARD_KILLS'), value: item.kills.toString(10), inline: true},
                {name: translate('LEADERBOARD_DEATHS'), value: item.deaths.toString(10), inline: true},
            ]);
        }
    }
    return message;
}

function renderSingle(
    renderInline: boolean,
    items: LeaderboardItem[],
    message: EmbedBuilder,
    titleKey: string,
    itemKey: keyof LeaderboardItem | ((item: LeaderboardItem) => string),
): EmbedBuilder {
    let valueFn: (item: LeaderboardItem) => string;
    if (typeof itemKey === 'string') {
        valueFn = (item: LeaderboardItem) => {
            const v = item[itemKey];
            if (typeof v === 'number') {
                return v.toString(10);
            } else if (typeof v === 'string') {
                return v;
            } else {
                return JSON.stringify(v);
            }
        }
    } else {
        valueFn = itemKey;
    }

    const longestRank = maxLength(items, translate('LEADERBOARD_RANK'), (item) => item.rank.toString(10));
    const longestName = maxLength(items, translate('LEADERBOARD_NAME'), (item) => item.name);
    const longestValue = maxLength(items, translate(titleKey), valueFn);

    if (renderInline) {
        let text = '```' +
            translate('LEADERBOARD_RANK') + ' '.repeat(longestRank - translate('LEADERBOARD_RANK').length) + '\t' +
            translate('LEADERBOARD_NAME') + ' '.repeat(longestName - translate('LEADERBOARD_NAME').length) + '\t\t' +
            translate(titleKey) + ' '.repeat(longestValue - translate(titleKey).length) + '\n\n';
        for (let item of items) {
            const toAppend =
                ' '.repeat(longestRank - item.rank.toString(10).length) + item.rank + '\t' +
                item.name + ' '.repeat(longestName - item.name.length) + '\t\t' +
                valueFn(item) + ' '.repeat(longestValue - valueFn(item).length) + '\n';

            if (text.length + 6 + toAppend.length >= MAX_DISCORD_FIELD_SIZE) {
                text += '...';
                break;
            }
            text += toAppend;
        }
        text += '```';
        message.addFields([{name: '\u200b', value: text}]);
    } else {
        for (let item of items) {
            message.addFields([{
                name: item.rank.toString(10), value: item.name, inline: true,
            }, {
                name: '\u200b', value: '\u200b', inline: true,
            }, {
                name: translate(titleKey), value: valueFn(item), inline: true,
            }]);
        }
    }
    return message;
}

export class Leaderboard implements Command {
    public static readonly COMMAND = 'leaderboard';

    constructor(private readonly server: CFToolsServer, private readonly parameters: Map<string, string>, private readonly config: Config) {
    }

    availableParameters(): ParameterDescription {
        return {
            statistic: {
                description: translate('LEADERBOARD_STAT_DESCRIPTION'),
                choices: Object.keys(statMapping),
            }
        };
    }

    async execute(client: CFToolsClient, messageBuilder: EmbedBuilder): Promise<string | EmbedBuilder> {
        const stat = this.resolveCommand();
        if (typeof stat === 'string') {
            return stat;
        }
        const response = await client.getLeaderboard({
            serverApiId: ServerApiId.of(this.server.serverApiId),
            order: 'ASC',
            statistic: stat.requestStatistic,
            limit: this.config.numberOfPlayers,
        });

        const message = messageBuilder
            .setTitle(translate('LEADERBOARD_TITLE', {
                params: {
                    amount: this.config.numberOfPlayers.toString(10),
                    server: this.server.name,
                    metric: translate(stat.metricKey)
                }
            }));

        if (response.length === 0) {
            message.addFields([{
                name: translate('LEADERBOARD_EMPTY_TITLE'),
                value: translate('LEADERBOARD_EMPTY_BODY'),
            }]);
            return message;
        } else {
            return this.renderLeaderboard(stat, response, message);
        }
    }

    private mustRenderInline(): boolean {
        return this.config.numberOfPlayers * 3 > 25;
    }

    private renderLeaderboard(stat: Mapping, response: LeaderboardItem[], message: EmbedBuilder): EmbedBuilder {
        switch (stat.requestStatistic) {
            case Statistic.KILLS:
            case Statistic.DEATHS:
                return renderKillDeath(this.mustRenderInline(), response, message);
            case Statistic.SUICIDES:
                return renderSingle(this.mustRenderInline(), response, message, 'LEADERBOARD_SUICIDES', 'suicides');
            case Statistic.PLAYTIME:
                return renderSingle(this.mustRenderInline(), response, message, 'LEADERBOARD_PLAYTIME', (item: LeaderboardItem) => secondsToHours(item.playtime));
            case Statistic.KILL_DEATH_RATIO:
                return renderSingle(this.mustRenderInline(), response, message, 'LEADERBOARD_KD_RATIO', 'killDeathRation');
            case Statistic.LONGEST_KILL:
                return renderSingle(this.mustRenderInline(), response, message, 'LEADERBOARD_LONGEST_KILL', (item: LeaderboardItem) => item.longestKill + 'm');
            case Statistic.LONGEST_SHOT:
                return renderSingle(this.mustRenderInline(), response, message, 'LEADERBOARD_LONGEST_SHOT', (item: LeaderboardItem) => item.longestShot + 'm');
            default:
                throw Error('Can not render unknown requested statistic.');
        }
    }

    private resolveCommand(): Mapping | string {
        let statCandidate = 'kills';
        if (this.parameters.has('statistic')) {
            statCandidate = this.parameters.get('statistic')!!;
        }
        let key: string | undefined = undefined;
        if (!this.config.allowedStats.includes(statCandidate)) {
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
