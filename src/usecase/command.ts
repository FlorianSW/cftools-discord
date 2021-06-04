import {CFToolsServer, CommandConfig} from '../domain/cftools';
import {SteamId64} from 'cftools-sdk';
import {Command} from '../domain/command';
import {MessageEmbed} from 'discord.js';
import {CheckPriorityQueue} from './check-priority-queue';
import {Leaderboard} from './leaderboard';

export function defaultResponse(): MessageEmbed {
    return new MessageEmbed()
        .setAuthor('CFTools-Discord bot')
        .setFooter('Bot made by FlorianSW with data from CFTools Cloud')
        .setTimestamp(new Date())
        .setColor('BLUE');
}

export type CommandFactory = (server: CFToolsServer, parameters: string[], config?: CommandConfig) => Command;
export const factories = new Map<string, CommandFactory>([
    [CheckPriorityQueue.COMMAND, (server, parameters) => {
        return new CheckPriorityQueue(server, SteamId64.of(parameters[0]));
    }],
    [Leaderboard.COMMAND, (server, parameters, config) => {
        return new Leaderboard(server, parameters, config || {});
    }]
]);
