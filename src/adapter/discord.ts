import {Message} from 'discord.js';

export function toParameters(message: Message): string[] {
    const mentions = message.mentions.members;
    let content = message.content;
    if (mentions) {
        for (let member of mentions.array()) {
            content = content
                .replace(`<@!${member.id}>`, '')
                .replace(`<@${member.id}>`, '');
        }
    }
    return content.trim().split(' ');
}
