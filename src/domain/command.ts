import {CFToolsServer} from './cftools';
import {CFToolsClient} from 'cftools-sdk';

export interface Command {
    readonly server: CFToolsServer

    execute(client: CFToolsClient): Promise<string>
}
