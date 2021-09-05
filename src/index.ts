import {Client, Message, TextChannel} from 'discord.js';
import {config as dotenv} from 'dotenv'
import {CFToolsServer, CommandNotAllowed, UnknownCommand, UnknownServer, UsageError} from './domain/cftools';
import {toParameters} from './adapter/discord';
import {Servers} from './adapter/servers';
import {CFToolsClient, CFToolsClientBuilder} from 'cftools-sdk';
import * as fs from 'fs';
import {ApplicationConfig, PresenceConfig} from './domain/app';
import {factories} from './usecase/command';
import {translate} from './translations';
import {defaultResponse} from './domain/command';

dotenv();

function isAllowedChannel(message: Message) {
    if (config.discord?.channels === undefined || typeof config.discord?.channels === 'boolean') {
        return true;
    }
    return message.channel instanceof TextChannel && config.discord.channels.includes(message.channel.name);
}

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

    private async onMessage(message: Message): Promise<void> {
        const parameters = toParameters(message);
        try {
            const command = this.servers.newCommand(parameters, message.member!!);
            const reply = await message.channel.send(defaultResponse().setColor('DARK_GREY').setTitle(randomLoadingMessage()));
            const response = await command.execute(this.cftools, defaultResponse().setAuthor(this.author));
            await reply.edit(response);
        } catch (e) {
            if (e instanceof UsageError) {
                await message.reply(e.message);
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
            await message.reply(translate(translateKey));
        }
    }

    private createDiscordClient(): Promise<Client> {
        return new Promise((resolve, reject) => {
            const client = new Client();
            client.on('ready', () => {
                console.log(`Logged in as ${client.user?.tag}!`);
                if (this.presence) {
                    client.user?.setActivity({
                        type: this.presence.type,
                        name: this.presence.text
                    });
                }
                resolve(client);
            });
            client.on('message', async (message: Message) => {
                if (this.client?.user && message.mentions.has(this.client?.user) && isAllowedChannel(message)) {
                    await this.onMessage(message);
                }
            });
            client.on('error', (error) => {
                console.log(error);
                reject(error);
            });
            client.on('warn', console.log);

            // TODO: Deprecated use of config.discordToken, remove when appropriate migration time given
            client.login(config?.discord?.token || config.discordToken);
        });
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
