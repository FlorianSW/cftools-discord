import {Command, defaultResponse} from '../domain/command';
import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, Game, ResourceNotFound} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';
import {translate} from '../translations';

export class DetailsCommand implements Command {
    public static readonly COMMAND = 'details';

    constructor(private readonly server: CFToolsServer) {
    }

    async execute(client: CFToolsClient, messageBuilder: MessageEmbed): Promise<string | MessageEmbed> {
        try {
            const response = await client.getGameServerDetails({
                game: Game.DayZ,
                ip: this.server.connect.ip,
                port: this.server.connect.port,
            });
            let players = `${response.status.players.online}/${response.status.players.slots}`;
            if (response.status.players.queue !== 0) {
                players += ` (+${response.status.players.queue})`;
            }
            return messageBuilder
                .setTitle(translate('DETAILS_TITLE', {
                    params: {
                        serverName: this.server.name
                    }
                }))
                .addField(translate('DETAILS_SERVER_NAME'), response.name)
                .addField(translate('DETAILS_MAP'), response.map, true)
                .addField(translate('DETAILS_PLAYERS'), players, true)
                .addField(translate('DETAILS_TIME'), response.environment.time, true);
        } catch (error) {
            if (error instanceof ResourceNotFound) {
                return translate('DETAILS_ERROR_SERVER_NOT_FOUND');
            }
            console.error(error);
            return translate('ERROR_UNKNOWN');
        }
    }
}
