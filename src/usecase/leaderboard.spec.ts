import {Leaderboard} from './leaderboard';
import {CFToolsClient, CFToolsClientBuilder, LeaderboardItem, Statistic} from 'cftools-sdk';
import {translate} from '../translations';
import {MessageEmbed} from 'discord.js';
import Mock = jest.Mock;
import {CFToolsServer} from '../domain/cftools';

const aServer = {
    serverApiId: 'A_SERVER_ID',
    commandMapping: {},
    connect: {
        ip: '127.0.0.1',
        port: 2302
    },
    name: 'A_NAME',
} as CFToolsServer;

describe('Leaderboard', () => {
    let client: CFToolsClient;

    beforeEach(() => {
        const partialClient = {
            getLeaderboard: jest.fn(() => Promise.resolve([{} as LeaderboardItem]))
        } as Partial<CFToolsClient>;
        client = partialClient as CFToolsClient;
    })

    it('disallows stats, which are not whitelisted', async () => {
        const command = new Leaderboard(aServer, ['deaths'], {
            allowedStats: ['kills', 'suicides'], defaultStat: 'kills'
        });

        const response = await command.execute(new CFToolsClientBuilder().build(), new MessageEmbed());

        expect(response).toEqual(translate('LEADERBOARD_STAT_NOT_ALLOWED', {
            params: {
                allowedStats: 'kills, suicides'
            }
        }));
    });

    it('does not process unknown stats', async () => {
        const command = new Leaderboard(aServer, ['unknown'], {
            allowedStats: ['deaths'], defaultStat: 'deaths'
        });

        const response = await command.execute(new CFToolsClientBuilder().build(), new MessageEmbed());

        expect(response).toEqual(translate('LEADERBOARD_STAT_NOT_KNOWN', {
            params: {
                allowedStats: 'deaths'
            }
        }));
    });

    it('request default stat when not specified', async () => {
        const command = new Leaderboard(aServer, [], {
            allowedStats: ['kills', 'suicides'], defaultStat: 'suicides'
        });

        const response = await command.execute(client as CFToolsClient, new MessageEmbed());

        expect(response).toBeInstanceOf(MessageEmbed);
        expect(client.getLeaderboard).toHaveBeenCalledTimes(1);
        const call = (client.getLeaderboard as Mock).mock.calls[0];
        expect(call[0]).toMatchObject({
            statistic: Statistic.KILLS
        });
    });

    it.each([
        ['deaths', Statistic.DEATHS],
        ['kdratio', Statistic.KILL_DEATH_RATION],
        ['longest_shot', Statistic.LONGEST_SHOT],
        ['longest_kill', Statistic.LONGEST_KILL],
        ['playtime', Statistic.PLAYTIME],
        ['suicides', Statistic.SUICIDES],
        ['kills', Statistic.KILLS],
    ])('serves requested stat', async (stat: string, expected: Statistic) => {
        const command = new Leaderboard(aServer, [stat], {
            allowedStats: [stat], defaultStat: 'suicides'
        });

        await command.execute(client as CFToolsClient, new MessageEmbed());

        expect(client.getLeaderboard).toHaveBeenCalledTimes(1);
        const call = (client.getLeaderboard as Mock).mock.calls[0];
        expect(call[0]).toMatchObject({
            statistic: expected
        });
    });
});
