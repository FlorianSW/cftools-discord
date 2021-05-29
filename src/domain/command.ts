import {CFToolsClient} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';

export interface Command {
    execute(client: CFToolsClient): Promise<string | MessageEmbed>
}
