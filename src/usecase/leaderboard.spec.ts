import {Leaderboard} from './leaderboard';
import {CFToolsClient, CFToolsClientBuilder, LeaderboardItem, Statistic} from 'cftools-sdk';
import {translate} from '../translations';
import {CFToolsServer} from '../domain/cftools';
import Mock = jest.Mock;
import {EmbedBuilder} from 'discord.js';

const aServer = {
    serverApiId: 'A_SERVER_ID',
    commands: {},
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
            getLeaderboard: jest.fn(() => Promise.resolve([{
                playtime: 1024,
                hits: 100,
                environmentDeaths: 1,
                kills: 2,
                rank: 1,
                longestKill: 100,
                longestShot: 100,
                name: 'A_NAME',
                deaths: 1,
                killDeathRation: 2,
                suicides: 0,
            } as LeaderboardItem]))
        } as Partial<CFToolsClient>;
        client = partialClient as CFToolsClient;
    })

    it('disallows stats, which are not whitelisted', async () => {
        const command = new Leaderboard(aServer, new Map([['statistic', 'deaths']]), {
            allowedStats: ['kills', 'suicides'], defaultStat: 'kills', numberOfPlayers: 7,
        });

        const response = await command.execute(new CFToolsClientBuilder().build(), new EmbedBuilder());

        expect(response).toEqual(translate('LEADERBOARD_STAT_NOT_ALLOWED', {
            params: {
                allowedStats: 'kills, suicides'
            }
        }));
    });

    it('does not process unknown stats', async () => {
        const command = new Leaderboard(aServer, new Map([['statistic', 'unknown']]), {
            allowedStats: ['deaths'], defaultStat: 'deaths', numberOfPlayers: 7,
        });

        const response = await command.execute(new CFToolsClientBuilder().build(), new EmbedBuilder());

        expect(response).toEqual(translate('LEADERBOARD_STAT_NOT_ALLOWED', {
            params: {
                allowedStats: 'deaths'
            }
        }));
    });

    it('request default stat when not specified', async () => {
        const command = new Leaderboard(aServer, new Map(), {
            allowedStats: ['kills', 'suicides'], defaultStat: 'suicides', numberOfPlayers: 7,
        });

        const response = await command.execute(client as CFToolsClient, new EmbedBuilder());

        expect(response).toBeInstanceOf(EmbedBuilder);
        expect(client.getLeaderboard).toHaveBeenCalledTimes(1);
        const call = (client.getLeaderboard as Mock).mock.calls[0];
        expect(call[0]).toMatchObject({
            statistic: Statistic.KILLS
        });
    });

    it.each([
        ['deaths', Statistic.DEATHS],
        ['kdratio', Statistic.KILL_DEATH_RATIO],
        ['longest_shot', Statistic.LONGEST_SHOT],
        ['longest_kill', Statistic.LONGEST_KILL],
        ['playtime', Statistic.PLAYTIME],
        ['suicides', Statistic.SUICIDES],
        ['kills', Statistic.KILLS],
    ])('serves requested stat', async (stat: string, expected: Statistic) => {
        const command = new Leaderboard(aServer, new Map([['statistic', stat]]), {
            allowedStats: [stat], defaultStat: 'suicides', numberOfPlayers: 7,
        });

        await command.execute(client as CFToolsClient, new EmbedBuilder());

        expect(client.getLeaderboard).toHaveBeenCalledTimes(1);
        const call = (client.getLeaderboard as Mock).mock.calls[0];
        expect(call[0]).toMatchObject({
            statistic: expected
        });
    });
});
