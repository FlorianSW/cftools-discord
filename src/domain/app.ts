import {CFToolsServer} from './cftools';
import {ExcludeEnum} from 'discord.js';
import {ActivityTypes} from 'discord.js/typings/enums';

export interface ApplicationConfig {
    servers: CFToolsServer[],
    discord?: {
        token?: string,
        author?: string,
        guild: {
            id: string,
        },
        presence: PresenceConfig | boolean,
    },
    cftools: {
        applicationId: string,
        secret: string,
    }
}

export interface PresenceConfig {
    type: ExcludeEnum<typeof ActivityTypes, 'CUSTOM'>,
    text: string,
}
