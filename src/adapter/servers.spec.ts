import {Servers} from './servers';
import {CFToolsServer, CommandConfig, UnknownServer} from '../domain/cftools';
import {CommandFactory} from '../usecase/command';
import {CFToolsClient} from 'cftools-sdk';
import {Command, ParameterDescription} from '../domain/command';

class FakeCommand implements Command {
    constructor(public readonly server: CFToolsServer, public readonly parameters: Map<string, string>, public readonly config?: CommandConfig) {
    }

    execute(client: CFToolsClient): Promise<string> {
        return Promise.reject('Not meant to be executed in this test.');
    }

    availableParameters(): ParameterDescription {
        return {};
    }
}

describe('Servers', () => {
    const factories = new Map<string, CommandFactory>([
        ['hasPriority', (server: CFToolsServer, parameters: Map<string, string>) => {
            return new FakeCommand(server, parameters);
        }],
        ['anotherCommand', (server: CFToolsServer, parameters: Map<string, string>, config?: CommandConfig) => {
            return new FakeCommand(server, parameters, config);
        }]
    ]);
    let servers: Servers;

    beforeEach(() => {
        servers = new Servers([{
            name: 'A_SERVER',
            serverApiId: 'SOME_ID',
            connect: {
                ip: '127.0.0.1',
                port: 2302
            },
            commands: {
                hasPriority: {},
                anotherCommand: {
                    A_KEY: 'A_VALUE',
                }
            },
        }, {
            name: 'ANOTHER_SERVER',
            connect: {
                ip: '127.0.0.1',
                port: 2402
            },
            serverApiId: 'ANOTHER_ID',
            commands: {
                hasPriority: {},
            },
        }], factories);
    });

    it('throws when server not found', () => {
        expect(() => servers.newCommand('hasPriority', new Map([['server', 'UNKNOWN'], ['steam_id', '123456789']]))).toThrowError(new UnknownServer());
    });

    it('returns command', () => {
        const command = servers.newCommand('hasPriority', new Map([['server', 'A_SERVER'], ['steam_id', '123456789']]));

        expect(command).toBeInstanceOf(FakeCommand);
        expect((command as FakeCommand).parameters).toEqual(new Map([['server', 'A_SERVER'], ['steam_id', '123456789']]));
    });

    it('returns command with config', () => {
        const command = servers.newCommand('anotherCommand', new Map([['server', 'A_SERVER'], ['steam_id', '123456789']]));

        expect(command).toBeInstanceOf(FakeCommand);
        expect((command as FakeCommand).config).toEqual({
            A_KEY: 'A_VALUE',
        });
    });

    describe('one server configured only', () => {
        beforeEach(() => {
            servers = new Servers([{
                name: 'A_SERVER',
                serverApiId: 'SOME_ID',
                connect: {
                    ip: '127.0.0.1',
                    port: 2302
                },
                commands: {
                    hasPriority: {},
                },
            }], factories);
        });

        it('returns command with parameters', () => {
            const command = servers.newCommand('hasPriority', new Map([['steam_id', '123456789']]));

            expect(command).toBeInstanceOf(FakeCommand);
            expect((command as FakeCommand).parameters).toEqual(new Map([['steam_id', '123456789']]));
        });

        it('returns command without parameters', () => {
            const command = servers.newCommand('hasPriority', new Map());

            expect(command).toBeInstanceOf(FakeCommand);
            expect((command as FakeCommand).parameters).toEqual(new Map());
        });
    });
});
