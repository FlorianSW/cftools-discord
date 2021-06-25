import {CFToolsServer} from './cftools';
import {ActivityType} from 'discord.js';

export interface ApplicationConfig {
    servers: CFToolsServer[],
    discordToken?: string,
    discord?: {
        token?: string,
        author?: string,
        channels?: string[] | boolean,
        presence: PresenceConfig | boolean,
    },
    cftools: {
        applicationId: string,
        secret: string,
    }
}

export interface PresenceConfig {
    type: ActivityType,
    text: string,
}
