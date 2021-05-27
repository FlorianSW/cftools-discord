import {CFToolsServer} from './cftools';

export interface ApplicationConfig {
    servers: CFToolsServer[],
    discordToken: string,
    cftools: {
        applicationId: string,
        secret: string,
    }
}
