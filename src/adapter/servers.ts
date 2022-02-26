import {CommandFactory} from '../usecase/command';
import {CFToolsServer, UnknownCommand, UnknownServer} from '../domain/cftools';
import {Command, ParameterDescription} from '../domain/command';

export class Servers {
    constructor(private readonly servers: CFToolsServer[], private readonly factories: Map<string, CommandFactory>) {
    }

    newCommand(cmdName: string, parameters: Map<string, string>): Command {
        const server = this.findServer(cmdName, parameters);
        if (server === undefined) {
            throw new UnknownServer();
        }
        const factory = this.factories.get(cmdName);
        if (factory === undefined) {
            throw new UnknownCommand();
        }
        const config = server.commands[cmdName];

        return factory(server, parameters, config);
    }

    availableCommands(): {
        [name: string]: {
            availableServers: string[],
            availableParameters: ParameterDescription,
        }
    } {
        const result: {
            [name: string]: {
                availableServers: string[],
                availableParameters: ParameterDescription,
            }
        } = {};
        for (let server of this.servers) {
            for (let c of Object.keys(server.commands)) {
                if (c in result) {
                    result[c].availableServers.push(server.name);
                } else {
                    const factory = this.factories.get(c)!!;
                    const command = factory(this.servers[0], new Map(), {});

                    result[c] = {
                        availableServers: [server.name],
                        availableParameters: command.availableParameters(),
                    };
                }
            }
        }
        return result;
    }

    private findServer(cmdName: string, parameters: Map<string, string>): CFToolsServer | undefined {
        const cmd = this.availableCommands()[cmdName];
        if (!cmd) {
            return undefined;
        }
        const cmdServers = cmd.availableServers;
        let server = cmdServers.find((s) => s === parameters.get('server'));
        if (server === undefined && cmdServers.length === 1) {
            server = cmdServers[0];
        }
        return this.servers.find((s) => s.name === server);
    }
}
