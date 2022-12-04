import {Command, ParameterDescription} from '../domain/command';
import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, Game, GameServerQueryError, ResourceNotFound} from 'cftools-sdk';
import {EmbedBuilder} from 'discord.js';
import {translate} from '../translations';

export class DetailsCommand implements Command {
    public static readonly COMMAND = 'details';

    constructor(private readonly server: CFToolsServer) {
    }

    async execute(client: CFToolsClient, messageBuilder: EmbedBuilder): Promise<string | EmbedBuilder> {
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
                .addFields([
                    {name: translate('DETAILS_SERVER_NAME'), value: response.name, inline: false},
                    {name: translate('DETAILS_MAP'), value: response.map, inline: true},
                    {name: translate('DETAILS_PLAYERS'), value: players, inline: true},
                    {name: translate('DETAILS_TIME'), value: response.environment.time, inline: true},
                ]);
        } catch (error) {
            if (error instanceof ResourceNotFound) {
                return translate('DETAILS_ERROR_SERVER_NOT_FOUND');
            }
            if (error instanceof GameServerQueryError) {
                return translate('DETAILS_QUERY_ERROR');
            }
            console.error(error);
            return translate('ERROR_UNKNOWN');
        }
    }

    availableParameters(): ParameterDescription {
        return {};
    }
}
