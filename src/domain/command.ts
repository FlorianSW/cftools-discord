import {CFToolsClient} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';

export type ParameterDescription = {
    [name: string]: {
        description: string,
        choices?: string[],
        required?: boolean,
    }
};

export interface Command {
    execute(client: CFToolsClient, response: MessageEmbed): Promise<string | MessageEmbed>;

    availableParameters(): ParameterDescription;
}

export function defaultResponse(): MessageEmbed {
    return new MessageEmbed()
        .setFooter({text: 'Bot made by FlorianSW with data from CFTools Cloud'})
        .setTimestamp(new Date())
        .setColor('BLUE');
}
