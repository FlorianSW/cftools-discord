import {Command, factories} from '../usecase/command';
import {CFToolsServer, UnknownCommand, UnknownServer} from '../domain/cftools';

export class Servers {
    constructor(private readonly servers: CFToolsServer[]) {
    }

    newCommand(parameters: string[]): Command {
        if (parameters.length < 2 || (this.servers.length === 1 && parameters.length < 1)) {
            throw new UnknownCommand();
        }
        const server = this.findServer(parameters);
        if (server === undefined) {
            throw new UnknownServer();
        }
        const command = this.findCommand(server, parameters);
        if (command === undefined) {
            throw new UnknownCommand();
        }
        const factory = factories.get(command);
        if (factory === undefined) {
            throw new UnknownCommand();
        }
        let cmdParameters;
        if (this.servers.length === 1 && parameters[0] !== server.name) {
            cmdParameters = parameters.slice(1);
        } else {
            cmdParameters = parameters.slice(2);
        }
        return factory(server, cmdParameters);
    }

    private findServer(parameters: string[]): CFToolsServer | undefined {
        let server = this.servers.find((s) => s.name === parameters[0]);
        if (server === undefined && this.servers.length === 1) {
            return this.servers[0];
        }
        return server;
    }

    private findCommand(server: CFToolsServer, parameters: string[]): string | undefined {
        let cmd = '';
        if (this.servers.length === 1 && parameters[0] !== server.name) {
            cmd = parameters[0];
        } else {
            cmd = parameters[1];
        }
        return server.commandMapping[cmd];
    }
}
