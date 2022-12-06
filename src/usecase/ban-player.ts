import {AutocompleteCommand, Command, ParameterDescription} from '../domain/command';
import {CFToolsServer, CommandConfig} from '../domain/cftools';
import {Banlist, CFToolsClient, CFToolsId, GenericId, IPAddress, ServerApiId, SteamId64} from 'cftools-sdk';
import {translate} from '../translations';
import {EmbedBuilder} from 'discord.js';
import {isIPv4} from 'net';
import exp from 'constants';

interface Config extends CommandConfig {
    banlists: { [name: string]: string }
}

export class BanPlayer implements Command, AutocompleteCommand {
    public static readonly COMMAND = 'banplayer';

    constructor(private readonly server: CFToolsServer, private readonly parameters: Map<string, string>, private readonly config: Config) {
    }

    availableParameters(): ParameterDescription {
        return {
            player_id: {
                description: translate('BAN_PLAYER_ID_DESCRIPTION'),
                required: true,
                autocomplete: true,
            },
            banlist: {
                description: translate('BAN_BANLIST_DESCRIPTION'),
                required: true,
                autocomplete: true,
            },
            expiration: {
                description: translate('BAN_EXPIRATION_DESCRIPTION'),
                autocomplete: true,
            },
        };
    }

    async autocomplete(cftools: CFToolsClient, p: string, v: string): Promise<Map<string, string>> {
        const res = new Map<string, string>();
        switch (p) {
            case 'player_id':
                const s = await cftools.listGameSessions({
                    serverApiId: ServerApiId.of(this.server.serverApiId),
                });
                s.forEach((gs) => res.set(gs.playerName, 'ctools:' + gs.cftoolsId.id));
                break;
            case 'banlist':
                Object.entries(this.config.banlists).forEach((v) => res.set(v[0], v[1]));
                break;
            case 'expiration':
                res.set(translate('BAN_EXPIRATION_PERMANENT'), 'Permanent');
                res.set(translate('BAN_EXPIRATION_IN_ONE_DAY'), new Date(new Date().getTime() + (60 * 60 * 24 * 1000)).toISOString());
                res.set(translate('BAN_EXPIRATION_IN_ONE_WEEK'), new Date(new Date().getTime() + (60 * 60 * 24 * 7 * 1000)).toISOString());
                res.set(translate('BAN_EXPIRATION_IN_ONE_MONTH'), new Date(new Date().getTime() + (60 * 60 * 24 * 31 * 1000)).toISOString());
                break;
        }
        return res;
    }

    async execute(client: CFToolsClient, messageBuilder: EmbedBuilder): Promise<string | EmbedBuilder> {
        const playerId = this.parameters.get('player_id');
        let player: GenericId;
        if (playerId?.startsWith('cftools:')) {
            player = CFToolsId.of(playerId);
        } else if (playerId && isIPv4(playerId)) {
            player = IPAddress.ofIpv4(playerId);
        } else if (playerId) {
            player = SteamId64.of(playerId);
        } else {
            return translate('BAN_PLAYER_ID_REQUIRED');
        }
        const banlistId = this.parameters.get('banlist');
        let banlist: Banlist;
        if (!banlistId) {
            return translate('BAN_BANLIST_REQUIRED');
        } else if (Object.values(this.config.banlists).includes(banlistId)) {
            banlist = Banlist.of(banlistId);
        } else {
            return translate('BAN_BANLIST_MISSING');
        }
        let expiration: Date | 'Permanent' = 'Permanent';
        if (this.parameters.has('expiration') && this.parameters.get('expiration')) {
            const e = this.parameters.get('expiration')!!;
            try {
                expiration = new Date(Date.parse(e));
            } catch (err) {
                return translate('BAN_INVALID_EXPIRATION', {params: {error: err as string}});
            }
        }
        await client.putBan({
            playerId: player,
            list: banlist,
            expiration: expiration,
            reason: 'Test-Ban by cftools-discord',
        });
        const bl = Object.entries(this.config.banlists).find((b) => b[1] === banlist.id);
        let banlistName = 'server banlist';
        if (bl) {
            banlistName = bl[0];
        }
        return translate('BAN_SUCCESS', {
            params: {
                name: player.id.toString(),
                banlist: banlistName,
                expiration: toString(expiration),
            },
        });
    }
}

function toString(s: Date | 'Permanent'): string {
    if (typeof s === 'string') {
        return s;
    }
    return s.toISOString();
}
