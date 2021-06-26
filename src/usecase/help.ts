import {Command} from '../domain/command';
import {CFToolsClient} from 'cftools-sdk';
import {MessageEmbed} from 'discord.js';
import {translate} from '../translations';
import {CommandFactory} from './command';
import {CFToolsServer} from '../domain/cftools';

export class HelpCommand implements Command {
    public static readonly COMMAND = 'help';

    constructor(private readonly server: CFToolsServer, private readonly commands: Map<string, CommandFactory>, private readonly command: string | undefined) {
    }

    async execute(client: CFToolsClient, messageBuilder: MessageEmbed): Promise<string | MessageEmbed> {
        let command: string | undefined = undefined;
        if (this.command === undefined) {
            command = HelpCommand.COMMAND;
        } else {
            const commandKey = Object.keys(this.server.commandMapping).find((c) => c.toLocaleLowerCase() === this.command!!.toLocaleLowerCase());
            if (commandKey !== undefined) {
                const id = this.server.commandMapping[commandKey];
                if (typeof id === 'string') {
                    command = id;
                } else {
                    command = id.command;
                }
            }
        }

        if (command === undefined) {
            return messageBuilder
                .setTitle(translate('HELP_TITLE'))
                .addField(translate('HELP_DESCRIPTION'), translate('HELP_COMMAND_NOT_FOUND'))
        }
        messageBuilder
            .setTitle(translate('HELP_TITLE'))
            .addField(translate('HELP_DESCRIPTION'), translate(`${command.toUpperCase()}_COMMAND_DESCRIPTION`))
            .addField(translate('HELP_USAGE'), translate(`${command.toUpperCase()}_COMMAND_USAGE`, {
                params: {
                    mapping: this.command || HelpCommand.COMMAND
                }
            }));

        if (command === HelpCommand.COMMAND) {
            messageBuilder.addField(translate('HELP_AVAILABLE_COMMANDS'), Object.keys(this.server.commandMapping))
        }

        return messageBuilder;
    }
}

