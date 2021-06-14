import {CommandFactory} from '../usecase/command';
import {CFToolsServer, CommandConfig, CommandId, UnknownCommand, UnknownServer} from '../domain/cftools';
import {Command} from '../domain/command';

export class Servers {
    constructor(private readonly servers: CFToolsServer[], private readonly factories: Map<string, CommandFactory>) {
    }

    newCommand(parameters: string[]): Command {
        if (this.servers.length === 1 && parameters.length === 0) {
            throw new UnknownCommand();
        }
        if (this.servers.length !== 1 && parameters.length < 2) {
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
        let factory: CommandFactory | undefined;
        let config: CommandConfig | undefined;
        if (typeof command === 'string') {
            factory = this.factories.get(command);
        } else {
            factory = this.factories.get(command.command);
            config = command.config;
        }
        if (factory === undefined) {
            throw new UnknownCommand();
        }
        let cmdParameters;
        if (this.servers.length === 1 && parameters[0] !== server.name) {
            cmdParameters = parameters.slice(1);
        } else {
            cmdParameters = parameters.slice(2);
        }
        return factory(server, cmdParameters, config);
    }

    private findServer(parameters: string[]): CFToolsServer | undefined {
        let server = this.servers.find((s) => s.name === parameters[0]);
        if (server === undefined && this.servers.length === 1) {
            return this.servers[0];
        }
        return server;
    }

    private findCommand(server: CFToolsServer, parameters: string[]): string | CommandId | undefined {
        let cmd = '';
        if (this.servers.length === 1 && parameters[0] !== server.name) {
            cmd = parameters[0];
        } else {
            cmd = parameters[1];
        }
        const commandKey = Object.keys(server.commandMapping).find((c) => c.toLocaleLowerCase() === cmd.toLocaleLowerCase());
        if (commandKey === undefined) {
            return undefined;
        }
        return server.commandMapping[commandKey];
    }
}
