import {toParameters} from './discord';
import {Collection, GuildMember, Message, Snowflake} from 'discord.js';

describe('Discord', () => {
    it('splits message to parameters', () => {
        expect(toParameters({
            content: '<@!123> GT1 hasPriority 123456789',
            mentions: {
                members: new Collection<Snowflake, GuildMember>([
                    ['123', {id: '123'} as GuildMember]
                ])
            },
        } as Partial<Message> as any as Message)).toEqual(['GT1', 'hasPriority', '123456789']);
    });
});
