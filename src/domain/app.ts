import { ActivityType } from 'discord.js';
import {CFToolsServer} from './cftools';

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
    type: Exclude<ActivityType, ActivityType.Custom>,
    text: string,
}
