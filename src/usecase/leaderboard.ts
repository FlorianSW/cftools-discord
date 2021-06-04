import {Command} from '../domain/command';
import {CFToolsServer, CommandConfig} from '../domain/cftools';
import {CFToolsClient, ServerApiId, Statistic} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';
import {translate} from '../translations';
import {defaultResponse} from './command';

export class Leaderboard implements Command {
    public static readonly COMMAND = 'leaderboard';

    constructor(private readonly server: CFToolsServer, parameters: string[], config: CommandConfig) {
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
