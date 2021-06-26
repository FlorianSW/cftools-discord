import {Command} from '../domain/command';
import {CFToolsServer} from '../domain/cftools';
import {CFToolsClient, ResourceNotFound, ServerApiId, SteamId64} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';
import {translate} from '../translations';
import {secondsToHours} from '../seconds-to-hours';

export class PlayerStatistics implements Command {
    public static readonly COMMAND = 'playerStats';

    constructor(private readonly server: CFToolsServer, private readonly steamId: SteamId64) {
    }

    async execute(client: CFToolsClient, messageBuilder: MessageEmbed): Promise<string | MessageEmbed> {
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
                }))
                .addField(translate('PLAYERSTATS_PLAYTIME'), secondsToHours(response.playtime), true)
                .addField(translate('PLAYERSTATS_KILLS'), response.statistics.kills, true)
                .addField(translate('PLAYERSTATS_DEATHS'), response.statistics.deaths, true)
                .addField(translate('PLAYERSTATS_LONGEST_KILL'), response.statistics.longestKill + 'm', true);

            const weapons = Object.entries(response.statistics.weaponsBreakdown).sort((w1, w2) => {
                return w2[1].hits - w1[1].hits;
            });
            if (weapons.length > 0) {
                const favoriteWeapon = weapons[0];
                messageBuilder.addField(translate('PLAYERSTATS_WEAPON_MOST_KILLS'), favoriteWeapon[0]);
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
}
