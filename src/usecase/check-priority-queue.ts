import {Command, defaultResponse} from '../domain/command';
import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, ResourceNotFound, ServerApiId, SteamId64} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';
import {translate} from '../translations';

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
