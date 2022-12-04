import {CFToolsClient} from 'cftools-sdk';
import {Colors, EmbedBuilder} from 'discord.js';

export type ParameterDescription = {
    [name: string]: {
        description: string,
        choices?: string[],
        autocomplete?: boolean,
        required?: boolean,
    }
};

export interface Command {
    execute(client: CFToolsClient, response: EmbedBuilder): Promise<string | EmbedBuilder>;

    availableParameters(): ParameterDescription;
}

export interface AutocompleteCommand {
    autocomplete(cftools: CFToolsClient, parameterName: string, userValue: string): Promise<Map<string, string>>;
}

export function supportsAutocompletion(c: any): c is AutocompleteCommand {
    return 'autocomplete' in c;
}

export function defaultResponse(): EmbedBuilder {
    return new EmbedBuilder()
        .setFooter({text: 'Bot made by FlorianSW with data from CFTools Cloud'})
        .setTimestamp(new Date())
        .setColor(Colors.Blue);
}
