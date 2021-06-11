import {CFToolsClient} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';

export interface Command {
    execute(client: CFToolsClient, response: MessageEmbed): Promise<string | MessageEmbed>
}

export function defaultResponse(): MessageEmbed {
    return new MessageEmbed()
        .setFooter('Bot made by FlorianSW with data from CFTools Cloud')
        .setTimestamp(new Date())
        .setColor('BLUE');
}
