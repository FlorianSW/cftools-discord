import {Client, Message} from 'discord.js';
import {config as dotenv} from 'dotenv'
import {CFToolsServer} from './domain/cftools';
import {toParameters} from './adapter/discord';
import {Servers} from './adapter/servers';
import {CFToolsClient, CFToolsClientBuilder} from 'cftools-sdk';
import * as fs from 'fs';
import {ApplicationConfig} from './domain/app';

dotenv();

class App {
    private client: Client | undefined;
    private servers: Servers;

    constructor(servers: CFToolsServer[], private readonly cftools: CFToolsClient) {
        this.servers = new Servers(servers);
    }

    public async setup() {
        this.client = await this.createDiscordClient();
    }

    public shutdown() {
        this.client?.destroy();
    }

    private async onMessage(message: Message): Promise<void> {
        const parameters = toParameters(message);
        const command = this.servers.newCommand(parameters);
        const response = await command.execute(this.cftools);
        await message.reply(response);
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

            client.login(config.discordToken);
        });
    }
}

const config: ApplicationConfig = JSON.parse(fs.readFileSync(process.env.CONFIG_FILE!!).toString('utf-8'));

console.log('Starting Discord Bot...');
const app = new App(
    config.servers,
    new CFToolsClientBuilder()
        .withCredentials(config.cftools.applicationId, config.cftools.secret)
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
