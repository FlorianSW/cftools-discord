import {Servers} from './servers';
import {CFToolsServer, CommandConfig, CommandNotAllowed, UnknownCommand, UnknownServer} from '../domain/cftools';
import {CommandFactory} from '../usecase/command';
import {CFToolsClient} from 'cftools-sdk';
import {Command} from '../domain/command';
import {Collection, GuildMember, GuildMemberRoleManager, Role} from 'discord.js';

class FakeCommand implements Command {
    constructor(public readonly server: CFToolsServer, public readonly parameters: string[], public readonly config?: CommandConfig) {
    }

    execute(client: CFToolsClient): Promise<string> {
        return Promise.reject('Not meant to be executed in this test.');
    }
}

let member: GuildMember;

describe('Servers', () => {
    const factories = new Map<string, CommandFactory>([
        ['hasPriority', (server: CFToolsServer, parameters: string[]) => {
            return new FakeCommand(server, parameters);
        }],
        ['requiresRole', (server: CFToolsServer, parameters: string[]) => {
            return new FakeCommand(server, parameters);
        }],
        ['anotherCommand', (server: CFToolsServer, parameters: string[], config?: CommandConfig) => {
            return new FakeCommand(server, parameters, config);
        }]
    ]);
    let servers: Servers;

    beforeEach(() => {
        member = {
            roles: {
                cache: new Collection(),
            } as Partial<GuildMemberRoleManager> as GuildMemberRoleManager
        } as GuildMember;

        servers = new Servers([{
            name: 'A_SERVER',
            serverApiId: 'SOME_ID',
            connect: {
                ip: '127.0.0.1',
                port: 2302
            },
            commandMapping: {
                hasPriority: 'hasPriority',
                requiresRole: {
                    command: 'requiresRole',
                    requiresRole: ['REQUIRED_ROLE'],
                    config: {},
                },
                anotherCommand: {
                    command: 'anotherCommand',
                    config: {
                        A_KEY: 'A_VALUE',
                    }
                },
            }
        }, {
            name: 'ANOTHER_SERVER',
            connect: {
                ip: '127.0.0.1',
                port: 2402
            },
            serverApiId: 'ANOTHER_ID',
            commandMapping: {}
        }], factories);
    });

    it('throws when server not found', () => {
        expect(() => servers.newCommand(['UNKNOWN', 'hasPriority', '123456789'], member)).toThrowError(new UnknownServer());
    });

    it('throws when server not found', () => {
        expect(() => servers.newCommand(['A_SERVER', 'UNKNOWN', '123456789'], member)).toThrowError(new UnknownCommand());
    });

    it('throws when command requires role the member does not have', () => {
        member.roles.cache.set('123456789', {name: 'SOME_ROLE'} as Role);
        expect(() => servers.newCommand(['A_SERVER', 'requiresRole', '123456789'], member)).toThrowError(new CommandNotAllowed());
    });

    it('returns command that requires role the member has', () => {
        member.roles.cache.set('123456789', {name: 'REQUIRED_ROLE'} as Role);
        expect(servers.newCommand(['A_SERVER', 'requiresRole', '123456789'], member)).not.toBeNull();
    });

    it('returns command', () => {
        const command = servers.newCommand(['A_SERVER', 'hasPriority', '123456789'], member);

        expect(command).toBeInstanceOf(FakeCommand);
        expect((command as FakeCommand).parameters).toEqual(['123456789']);
    });

    it('returns command when case not matched', () => {
        const command = servers.newCommand(['A_SERVER', 'hAspRioRiTy', '123456789'], member);

        expect(command).toBeInstanceOf(FakeCommand);
        expect((command as FakeCommand).parameters).toEqual(['123456789']);
    });

    it('returns command with config', () => {
        const command = servers.newCommand(['A_SERVER', 'anotherCommand', '123456789'], member);

        expect(command).toBeInstanceOf(FakeCommand);
        expect((command as FakeCommand).parameters).toEqual(['123456789']);
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
                commandMapping: {
                    hasPriority: 'hasPriority'
                }
            }], factories);
        });

        it('returns command with parameters', () => {
            const command = servers.newCommand(['hasPriority', '123456789'], member);

            expect(command).toBeInstanceOf(FakeCommand);
            expect((command as FakeCommand).parameters).toEqual(['123456789']);
        });

        it('returns command without parameters', () => {
            const command = servers.newCommand(['hasPriority'], member);

            expect(command).toBeInstanceOf(FakeCommand);
            expect((command as FakeCommand).parameters).toEqual([]);
        });
    });
});
