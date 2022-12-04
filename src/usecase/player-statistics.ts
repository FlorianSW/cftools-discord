import {Command, ParameterDescription} from '../domain/command';
import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, ResourceNotFound, ServerApiId, SteamId64} from 'cftools-sdk';
import {EmbedBuilder} from 'discord.js';
import {translate} from '../translations';
import {secondsToHours} from '../seconds-to-hours';

export class PlayerStatistics implements Command {
    public static readonly COMMAND = 'playerstats';

    constructor(private readonly server: CFToolsServer, private readonly steamId: SteamId64) {
    }

    async execute(client: CFToolsClient, messageBuilder: EmbedBuilder): Promise<string | EmbedBuilder> {
        try {
            const response = await client.getPlayerDetails({
                serverApiId: ServerApiId.of(this.server.serverApiId),
                playerId: this.steamId
            });

            messageBuilder
                .setTitle(translate('PLAYERSTATS_NAME', {
                    params: {
                        playerName: response.names[0]
                    }
                })).addFields([
                {name: translate('PLAYERSTATS_PLAYTIME'), value: secondsToHours(response.playtime), inline: true},
                {name: translate('PLAYERSTATS_KILLS'), value: response.statistics.kills.toString(10), inline: true},
                {name: translate('PLAYERSTATS_DEATHS'), value: response.statistics.deaths.toString(10), inline: true},
                {
                    name: translate('PLAYERSTATS_LONGEST_KILL'),
                    value: response.statistics.longestKill + 'm',
                    inline: true
                },
            ]);

            const weapons = Object.entries(response.statistics.weaponsBreakdown).sort((w1, w2) => {
                return w2[1].hits - w1[1].hits;
            });
            if (weapons.length > 0) {
                const favoriteWeapon = weapons[0];
                messageBuilder.addFields([{name: translate('PLAYERSTATS_WEAPON_MOST_KILLS'), value: favoriteWeapon[0]}]);
            }

            return messageBuilder;
        } catch (error) {
            if (error instanceof ResourceNotFound) {
                return translate('STEAM_ID_UNKNOWN');
            }
            console.error(error);
            return translate('ERROR_UNKNOWN');
        }
    }

    availableParameters(): ParameterDescription {
        return {
            steam_id: {
                description: translate('PLAYERSTATS_STEAM_ID_DESCRIPTION'),
                required: true,
            }
        };
    }
}
