import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, ResourceNotFound, ServerApiId, Statistic, SteamId64} from 'cftools-sdk';
import {translate} from '../translations';
import {Command} from '../domain/command';
import {MessageEmbed} from 'discord.js';

function defaultResponse(): MessageEmbed {
    return new MessageEmbed()
        .setAuthor('CFTools-Discord bot')
        .setFooter('Bot made by FlorianSW/go2tech.de with data from CFTools Cloud')
        .setTimestamp(new Date())
        .setColor('BLUE');
}

export class CheckPriorityQueue implements Command {
    public static readonly COMMAND = 'hasPriority';

    constructor(private readonly server: CFToolsServer, private readonly steamId: SteamId64) {
    }

    async execute(client: CFToolsClient): Promise<string | MessageEmbed> {
        try {
            const response = await client.getPriorityQueue({
                serverApiId: ServerApiId.of(this.server.serverApiId),
                playerId: this.steamId
            });
            const message = defaultResponse()
                .setTitle(translate('PRIORITY_TITLE', {
                    params: {
                        id: this.steamId.id
                    }
                }));
            if (response === null) {
                return message.setColor('DARK_RED')
                    .setDescription(translate('NO_PRIORITY'));
            } else {
                return message.setColor('DARK_GREEN')
                    .setDescription(translate('HAS_PRIORITY'))
                    .addField(
                        translate('PRIORITY_EXPIRES'),
                        response?.expiration instanceof Date ?
                            (response.expiration as Date).toLocaleString() :
                            translate('PRIORITY_EXPIRES_NEVER')
                    )
            }
        } catch (error) {
            if (error instanceof ResourceNotFound) {
                return translate('STEAM_ID_UNKNOWN');
            }
            console.error(error);
            return translate('ERROR_UNKNOWN');
        }
    }
}

export class Leaderboard implements Command {
    public static readonly COMMAND = 'leaderboard';

    constructor(private readonly server: CFToolsServer) {
    }

    async execute(client: CFToolsClient): Promise<string | MessageEmbed> {
        const message = defaultResponse()
            .setColor('BLUE')
            .setTitle(translate('LEADERBOARD_TITLE', {
                params: {
                    server: this.server.name,
                    metric: translate('LEADERBOARD_KILLS')
                }
            }));
        const response = await client.getLeaderboard({
            serverApiId: ServerApiId.of(this.server.serverApiId),
            order: 'ASC',
            statistic: Statistic.KILLS,
            limit: 7,
        });

        for (let item of response) {
            message.addField(item.rank, item.name, true)
                .addField(translate('LEADERBOARD_KILLS'), item.kills, true)
                .addField(translate('LEADERBOARD_DEATHS'), item.deaths, true);
        }
        if (message.fields.length === 0) {
            message.addField(translate('LEADERBOARD_EMPTY_TITLE'), translate('LEADERBOARD_EMPTY_BODY'))
        }
        return message;
    }

}

export type CommandFactory = (server: CFToolsServer, parameters: string[]) => Command;
export const factories = new Map<string, CommandFactory>([
    [CheckPriorityQueue.COMMAND, (server, parameters) => {
        return new CheckPriorityQueue(server, SteamId64.of(parameters[0]));
    }],
    [Leaderboard.COMMAND, (server) => {
        return new Leaderboard(server);
    }]
]);
