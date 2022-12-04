import {CFToolsClient} from 'cftools-sdk';
import {Colors, EmbedBuilder} from 'discord.js';

export type ParameterDescription = {
    [name: string]: {
        description: string,
        choices?: string[],
        required?: boolean,
    }
};

export interface Command {
    execute(client: CFToolsClient, response: EmbedBuilder): Promise<string | EmbedBuilder>;

    availableParameters(): ParameterDescription;
}

export function defaultResponse(): EmbedBuilder {
    return new EmbedBuilder()
        .setFooter({text: 'Bot made by FlorianSW with data from CFTools Cloud'})
        .setTimestamp(new Date())
        .setColor(Colors.Blue);
}
