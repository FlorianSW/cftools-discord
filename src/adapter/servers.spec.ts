import {Servers} from './servers';
import {UnknownCommand, UnknownServer} from '../domain/cftools';
import {CheckPriorityQueue} from '../usecase/command';

describe('Servers', () => {
    let servers: Servers;

    beforeEach(() => {
        servers = new Servers([{
            name: 'A_SERVER',
            serverApiId: 'SOME_ID',
            commandMapping: {
                [CheckPriorityQueue.COMMAND]: CheckPriorityQueue.COMMAND
            }
        }, {
            name: 'ANOTHER_SERVER',
            serverApiId: 'ANOTHER_ID',
            commandMapping: {}
        }]);
    });

    it('throws when server not found', () => {
        expect(() => servers.newCommand(['UNKNOWN', 'hasPriority', '123456789'])).toThrowError(new UnknownServer())
    });

    it('throws when server not found', () => {
        expect(() => servers.newCommand(['A_SERVER', 'UNKNOWN', '123456789'])).toThrowError(new UnknownCommand())
    });

    it('returns command', () => {
        expect(servers.newCommand(['A_SERVER', 'hasPriority', '123456789'])).toBeInstanceOf(CheckPriorityQueue)
    });

    it('returns command without server if only one server registered', () => {
        servers = new Servers([{
            name: 'A_SERVER',
            serverApiId: 'SOME_ID',
            commandMapping: {
                [CheckPriorityQueue.COMMAND]: CheckPriorityQueue.COMMAND
            }
        }]);
        expect(servers.newCommand(['hasPriority', '123456789'])).toBeInstanceOf(CheckPriorityQueue);
    });
});
