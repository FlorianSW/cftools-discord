import {CFToolsServer, CommandConfig, UsageError} from '../domain/cftools';
import {SteamId64} from 'cftools-sdk';
import {Command} from '../domain/command';
import {CheckPriorityQueue} from './check-priority-queue';
import {Leaderboard} from './leaderboard';
import {DetailsCommand} from './details';
import {PlayerStatistics} from './player-statistics';
import {translate} from '../translations';
import {HelpCommand} from './help';

function assertSteamId(parameters: string[]) {
    if (parameters.length === 0) {
        throw new UsageError(translate('ERROR_STEAM_ID_REQUIRED'));
    }
}

export type CommandFactory = (server: CFToolsServer, parameters: string[], config?: CommandConfig) => Command;
export const factories: Map<string, CommandFactory> = new Map<string, CommandFactory>([
    [CheckPriorityQueue.COMMAND, (server, parameters) => {
        assertSteamId(parameters);
        return new CheckPriorityQueue(server, SteamId64.of(parameters[0]));
    }],
    [DetailsCommand.COMMAND, (server) => {
        return new DetailsCommand(server);
    }],
    [PlayerStatistics.COMMAND, (server, parameters) => {
        assertSteamId(parameters);
        return new PlayerStatistics(server, SteamId64.of(parameters[0]));
    }],
    [Leaderboard.COMMAND, (server, parameters, config) => {
        return new Leaderboard(server, parameters, {
            ...{
                defaultStat: 'kills',
                allowedStats: ['kills', 'deaths', 'suicides', 'playtime', 'longest_kill', 'longest_shot', 'kdratio']
            },
            ...config,
        });
    }],
    [HelpCommand.COMMAND, (server, parameters) => {
        return new HelpCommand(server, factories, parameters[0]);
    }]
]);
