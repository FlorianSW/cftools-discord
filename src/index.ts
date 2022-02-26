import {ApplicationCommandDataResolvable, Client, Interaction} from 'discord.js';
import {config as dotenv} from 'dotenv'
import {CFToolsServer, CommandNotAllowed, UnknownCommand, UnknownServer, UsageError} from './domain/cftools';
import {Servers} from './adapter/servers';
import {CFToolsClient, CFToolsClientBuilder} from 'cftools-sdk';
import * as fs from 'fs';
import {ApplicationConfig, PresenceConfig} from './domain/app';
import {factories} from './usecase/command';
import {translate} from './translations';
import {ApplicationCommandOptionTypes, ApplicationCommandTypes} from 'discord.js/typings/enums';
import {defaultResponse} from './domain/command';

dotenv();

function randomLoadingMessage() {
    return translate('RESPONSE_LOADING_' + Math.floor(Math.random() * 4));
}

class App {
    private client: Client | undefined;
    private servers: Servers;

    constructor(servers: CFToolsServer[], private readonly cftools: CFToolsClient, private presence?: PresenceConfig) {
        this.servers = new Servers(servers, factories);
    }

    private get author(): string {
        return config?.discord?.author || 'CFTools-Discord bot';
    }

    public async setup() {
        this.client = await this.createDiscordClient();
    }

    public shutdown() {
        this.client?.destroy();
    }

    private async onInteraction(interaction: Interaction): Promise<void> {
        if (!interaction.isCommand()) {
            return;
        }
        const parameters: Map<string, string> = new Map(interaction.options.data.map((o) => [o.name, o.value as string]));
        if (!('guild' in interaction.member!!)) {
            throw new UsageError('API users are not permitted to use cftools-discord slash commands.');
        }

        try {
            const command = this.servers.newCommand(interaction.commandName, parameters);
            await interaction.reply({
                ephemeral: false,
                embeds: [defaultResponse().setColor('DARK_GREY').setTitle(randomLoadingMessage())],
            });
            const response = await command.execute(this.cftools, defaultResponse().setAuthor({name: this.author}));
            if (typeof response === 'string') {
                await interaction.editReply({
                    embeds: [],
                    content: response,
                });
            } else {
                await interaction.editReply({
                    embeds: [response],
                });
            }
        } catch (e) {
            if (e instanceof UsageError) {
                await interaction.reply({
                    content: e.message,
                    embeds: [],
                });
                return;
            }

            let translateKey: string | undefined = undefined;
            if (e instanceof UnknownServer) {
                translateKey = 'ERROR_UNKNOWN_SERVER';
            }
            if (e instanceof CommandNotAllowed) {
                translateKey = 'ERROR_COMMAND_NOT_ALLOWED';
            }
            if (e instanceof UnknownCommand) {
                translateKey = 'ERROR_UNKNOWN_COMMAND';
            }
            if (translateKey === undefined) {
                console.error('Unknown error occurred: ', e);
                return;
            }
            await interaction.reply({
                content: translate(translateKey),
                embeds: [],
            });
        }
    }

    private createDiscordClient(): Promise<Client> {
        return new Promise(async (resolve, reject) => {
            const client = new Client({
                intents: [],
            });
            client.on('ready', async () => {
                console.log(`Logged in as ${client.user?.tag}!`);
                if (this.presence) {
                    client.user?.setActivity({
                        type: this.presence.type,
                        name: this.presence.text
                    });
                }

                console.log('Setting up commands...');
                await this.setupDiscordCommands(client);
                resolve(client);
            });
            client.on('interactionCreate', async (interaction: Interaction) => {
                await this.onInteraction(interaction);
            });
            client.on('error', (error) => {
                console.log(error);
                reject(error);
            });
            client.on('warn', console.log);

            client.login(config?.discord?.token);
        });
    }

    private async setupDiscordCommands(client: Client) {
        const guildId = config.discord!!.guild.id;
        const registered = await client.application!!.commands.fetch({
            guildId: guildId,
        });
        const commands = this.servers.availableCommands();
        for (let command of Object.entries(commands)) {
            const discordCommand: ApplicationCommandDataResolvable = {
                name: command[0],
                type: ApplicationCommandTypes.CHAT_INPUT,
                description: translate(`${command[0].toUpperCase()}_COMMAND_DESCRIPTION`),
            };
            if (command[1].availableServers.length !== 1) {
                discordCommand.options = [{
                    type: ApplicationCommandOptionTypes.STRING,
                    name: translate('CMD_OPTIONS_SERVER_TITLE'),
                    description: translate('CMD_OPTIONS_SERVER_DESCRIPTION'),
                    required: command[1].availableServers.length !== 1,
                    choices: command[1].availableServers.map((s) => ({
                        name: s,
                        value: s,
                    })),
                }];
            }
            if (Object.keys(command[1].availableParameters).length !== 0) {
                if (!discordCommand.options) {
                    discordCommand.options = [];
                }

                for (let name of Object.keys(command[1].availableParameters)) {
                    const parameter = command[1].availableParameters[name];
                    discordCommand.options.push({
                        type: ApplicationCommandOptionTypes.STRING,
                        name: name,
                        description: parameter.description,
                        required: parameter.required,
                        autocomplete: parameter.choices === undefined,
                        choices: parameter.choices?.map((c) => ({
                            name: c,
                            value: c,
                        })),
                    });
                }
            }
            if (discordCommand.options?.length === 0 && registered.some((c) => c.name === command[0] && c.options.length !== 0)) {
                console.log('Command ' + command[0] + ' is only available for one server, deleting existing command to update options...');
                await client.application!!.commands.delete(registered.find((c) => c.name === command[0])!!, guildId);
            }
            await client.application!!.commands.create(discordCommand, guildId);
        }

        if (Object.keys(commands).length !== registered.size) {
            await Promise.all(registered.map(async (c) => {
                if (!commands[c.name]) {
                    await client.application!!.commands.delete(c, guildId);
                }
            }));
        }
    }
}

const configPath = process.env.CONFIG_FILE || 'config.json';
if (!fs.existsSync(configPath)) {
    console.error('Config file does not exist at path: ' + configPath);
    process.exit(1);
}
const config: ApplicationConfig = JSON.parse(fs.readFileSync(configPath).toString('utf-8'));

let presenceConfig: PresenceConfig | undefined;
if (config.discord && config.discord.presence && typeof config.discord.presence !== 'boolean') {
    presenceConfig = config.discord!!.presence;
}

console.log('Starting Discord Bot...');
const app = new App(
    config.servers,
    new CFToolsClientBuilder()
        .withCredentials(config.cftools.applicationId, config.cftools.secret)
        .withCache()
        .build(),
    presenceConfig
);
app.setup().then(async () => {
    console.log('App setup done...');
}, (e) => {
    console.log('Error starting the bot', e);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('App is shutting down on user event');
    app.shutdown();
    process.exit(0);
});
