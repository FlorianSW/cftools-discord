import {CFToolsServer, CommandConfig} from '../domain/cftools';
import {SteamId64} from 'cftools-sdk';
import {Command} from '../domain/command';
import {CheckPriorityQueue} from './check-priority-queue';
import {Leaderboard} from './leaderboard';
import {DetailsCommand} from './details';
import {PlayerStatistics} from './player-statistics';

export type CommandFactory = (server: CFToolsServer, parameters: Map<string, string>, config?: CommandConfig) => Command;
export const factories: Map<string, CommandFactory> = new Map<string, CommandFactory>([
    [CheckPriorityQueue.COMMAND, (server, parameters) => {
        return new CheckPriorityQueue(server, SteamId64.of(parameters.get('steam_id')!!));
    }],
    [DetailsCommand.COMMAND, (server) => {
        return new DetailsCommand(server);
    }],
    [PlayerStatistics.COMMAND, (server, parameters) => {
        return new PlayerStatistics(server, SteamId64.of(parameters.get('steam_id')!!));
    }],
    [Leaderboard.COMMAND, (server, parameters, config) => {
        return new Leaderboard(server, parameters, {
            ...{
                defaultStat: 'kills',
                numberOfPlayers: 7,
                allowedStats: ['kills', 'deaths', 'suicides', 'playtime', 'longest_kill', 'longest_shot', 'kdratio']
            },
            ...config,
        });
    }],
]);
