import {Command, ParameterDescription} from '../domain/command';
import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, ResourceNotConfigured, ResourceNotFound, ServerApiId, SteamId64} from 'cftools-sdk';
import {Colors, EmbedBuilder} from 'discord.js';
import {translate} from '../translations';

export class CheckPriorityQueue implements Command {
    public static readonly COMMAND = 'haspriority';

    constructor(private readonly server: CFToolsServer, private readonly steamId: SteamId64) {
    }

    async execute(client: CFToolsClient, messageBuilder: EmbedBuilder): Promise<string | EmbedBuilder> {
        try {
            const response = await client.getPriorityQueue({
                serverApiId: ServerApiId.of(this.server.serverApiId),
                playerId: this.steamId
            });
            const message = messageBuilder
                .setTitle(translate('PRIORITY_TITLE', {
                    params: {
                        id: this.steamId.id
                    }
                }));
            if (response === null) {
                return message.setColor(Colors.DarkRed)
                    .setDescription(translate('NO_PRIORITY'));
            } else {
                return message.setColor(Colors.DarkGreen)
                    .setDescription(translate('HAS_PRIORITY'))
                    .addFields([{
                        name: translate('PRIORITY_EXPIRES'),
                        value: response?.expiration instanceof Date ?
                            (response.expiration as Date).toLocaleString() :
                            translate('PRIORITY_EXPIRES_NEVER'),
                    }])
            }
        } catch (error) {
            if (error instanceof ResourceNotFound) {
                return translate('STEAM_ID_UNKNOWN');
            }
            if (error instanceof ResourceNotConfigured) {
                return translate('PRIORITY_NOT_CONFIGURED');
            }
            console.error(error);
            return translate('ERROR_UNKNOWN');
        }
    }

    availableParameters(): ParameterDescription {
        return {
            steam_id: {
                description: translate('HASPRIORITY_STEAM_ID_DESCRIPTION'),
                required: true,
            }
        };
    }
}
