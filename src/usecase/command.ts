import {CFToolsServer, CommandConfig} from '../domain/cftools';
import {SteamId64} from 'cftools-sdk';
import {Command} from '../domain/command';
import {CheckPriorityQueue} from './check-priority-queue';
import {Leaderboard} from './leaderboard';

export type CommandFactory = (server: CFToolsServer, parameters: string[], config?: CommandConfig) => Command;
export const factories = new Map<string, CommandFactory>([
    [CheckPriorityQueue.COMMAND, (server, parameters) => {
        return new CheckPriorityQueue(server, SteamId64.of(parameters[0]));
    }],
    [Leaderboard.COMMAND, (server, parameters, config) => {
        return new Leaderboard(server, parameters, {
            ...{
                defaultStat: 'kills',
                allowedStats: ['kills', 'deaths', 'suicides', 'playtime', 'longest_kill', 'longest_shot', 'kdratio']
            },
            ...config,
        });
    }]
]);
