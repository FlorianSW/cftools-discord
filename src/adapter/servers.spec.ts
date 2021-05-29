import {Servers} from './servers';
import {CFToolsServer, UnknownCommand, UnknownServer} from '../domain/cftools';
import {CommandFactory} from '../usecase/command';
import {CFToolsClient} from 'cftools-sdk';
import {Command} from '../domain/command';

class FakeCommand implements Command {
    constructor(public readonly server: CFToolsServer, public readonly parameters: string[]) {
    }

    execute(client: CFToolsClient): Promise<string> {
        return Promise.reject('Not meant to be executed in this test.');
    }
}

describe('Servers', () => {
    const factories = new Map<string, CommandFactory>([
        ['hasPriority', (server: CFToolsServer, parameters: string[]) => {
            return new FakeCommand(server, parameters)
        }]
    ]);
    let servers: Servers;

    beforeEach(() => {
        servers = new Servers([{
            name: 'A_SERVER',
            serverApiId: 'SOME_ID',
            commandMapping: {
                hasPriority: 'hasPriority'
            }
        }, {
            name: 'ANOTHER_SERVER',
            serverApiId: 'ANOTHER_ID',
            commandMapping: {}
        }], factories);
    });

    it('throws when server not found', () => {
        expect(() => servers.newCommand(['UNKNOWN', 'hasPriority', '123456789'])).toThrowError(new UnknownServer());
    });

    it('throws when server not found', () => {
        expect(() => servers.newCommand(['A_SERVER', 'UNKNOWN', '123456789'])).toThrowError(new UnknownCommand());
    });

    it('returns command', () => {
        const command = servers.newCommand(['A_SERVER', 'hasPriority', '123456789']);

        expect(command).toBeInstanceOf(FakeCommand);
        expect((command as FakeCommand).parameters).toEqual(['123456789']);
    });

    describe('one server configured only', () => {
        beforeEach(() => {
            servers = new Servers([{
                name: 'A_SERVER',
                serverApiId: 'SOME_ID',
                commandMapping: {
                    hasPriority: 'hasPriority'
                }
            }], factories);
        });

        it('returns command with parameters', () => {
            const command = servers.newCommand(['hasPriority', '123456789']);

            expect(command).toBeInstanceOf(FakeCommand);
            expect((command as FakeCommand).parameters).toEqual(['123456789']);
        });

        it('returns command without parameters', () => {
            const command = servers.newCommand(['hasPriority']);

            expect(command).toBeInstanceOf(FakeCommand);
            expect((command as FakeCommand).parameters).toEqual([]);
        });
    });
});
