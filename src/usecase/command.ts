import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, ResourceNotFound, ServerApiId, SteamId64} from 'cftools-sdk';
import {translate} from '../translations';
import {Command} from '../domain/command';

export class CheckPriorityQueue implements Command {
    public static readonly COMMAND = 'hasPriority';

    constructor(public readonly server: CFToolsServer, private readonly steamId: SteamId64) {
    }

    async execute(client: CFToolsClient): Promise<string> {
        try {
            const response = await client.getPriorityQueue({
                serverApiId: ServerApiId.of(this.server.serverApiId),
                playerId: this.steamId
            });
            if (response === null) {
                return translate('NO_PRIORITY');
            } else {
                return translate('PRIORITY_UNTIL', {
                    params: {
                        expires: response?.expiration ?
                            (response.expiration as Date).toLocaleString() :
                            translate('PRIORITY_EXPIRES_NEVER')
                    }
                });
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

export type CommandFactory = (server: CFToolsServer, parameters: string[]) => Command;
export const factories = new Map<string, CommandFactory>([
    [CheckPriorityQueue.COMMAND, (server, parameters) => {
        return new CheckPriorityQueue(server, SteamId64.of(parameters[0]));
    }]
]);
