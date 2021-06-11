import {Client, Message} from 'discord.js';
import {config as dotenv} from 'dotenv'
import {CFToolsServer, UnknownCommand, UnknownServer} from './domain/cftools';
import {toParameters} from './adapter/discord';
import {Servers} from './adapter/servers';
import {CFToolsClient, CFToolsClientBuilder} from 'cftools-sdk';
import * as fs from 'fs';
import {ApplicationConfig} from './domain/app';
import {factories} from './usecase/command';
import {translate} from './translations';
import {defaultResponse} from './domain/command';

dotenv();

class App {
    private client: Client | undefined;
    private servers: Servers;

    constructor(servers: CFToolsServer[], private readonly cftools: CFToolsClient) {
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
            const command = this.servers.newCommand(parameters);
            const response = await command.execute(this.cftools, defaultResponse().setAuthor(this.author));
            await message.reply(response);
        } catch (e) {
            let translateKey: string;
            if (e instanceof UnknownServer) {
                translateKey = 'ERROR_UNKNOWN_SERVER'
            }
            if (e instanceof UnknownCommand) {
                translateKey = 'ERROR_UNKNOWN_COMMAND'
            } else {
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
                resolve(client);
            });
            client.on('message', async (message: Message) => {
                if (this.client?.user && message.mentions.has(this.client?.user)) {
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

const config: ApplicationConfig = JSON.parse(fs.readFileSync(process.env.CONFIG_FILE!!).toString('utf-8'));

console.log('Starting Discord Bot...');
const app = new App(
    config.servers,
    new CFToolsClientBuilder()
        .withCredentials(config.cftools.applicationId, config.cftools.secret)
        .withCache()
        .build()
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
