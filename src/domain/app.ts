import {CFToolsServer} from './cftools';

export interface ApplicationConfig {
    servers: CFToolsServer[],
    discordToken?: string,
    discord?: {
        token?: string,
        author?: string,
    },
    cftools: {
        applicationId: string,
        secret: string,
    }
}
