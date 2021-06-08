import {CFToolsClient} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';

export interface Command {
    execute(client: CFToolsClient): Promise<string | MessageEmbed>
}

export function defaultResponse(): MessageEmbed {
    return new MessageEmbed()
        .setAuthor('CFTools-Discord bot')
        .setFooter('Bot made by FlorianSW with data from CFTools Cloud')
        .setTimestamp(new Date())
        .setColor('BLUE');
}
