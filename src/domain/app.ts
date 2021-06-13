import {CFToolsServer} from './cftools';

export interface ApplicationConfig {
    servers: CFToolsServer[],
    discordToken?: string,
    discord?: {
        token?: string,
        author?: string,
        channels?: string[] | boolean,
    },
    cftools: {
        applicationId: string,
        secret: string,
    }
}
