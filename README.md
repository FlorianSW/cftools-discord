# CFTools Cloud Discord bot

[![Docker Pulls](https://img.shields.io/docker/pulls/droidwiki/cftools-discord?style=flat-square)](https://hub.docker.com/r/droidwiki/cftools-discord)
[![Discord](https://img.shields.io/discord/729467994832371813?color=7289da&label=Discord&logo=discord&logoColor=ffffff&style=flat-square)](https://go2tech.de/discord)

> ⚠️With version 2 of this discord bot a lot of changes will be introduces onto how this tool works, how it is configured and what requirements need to be fulfilled to use it.
> **DO NOT** update your installation if you did not read through the documentation and changed the necessary configuration and pre-requisites. 

Provides a Discord bot to interact with the CFTools Cloud data which is exposed through the API.

## Installation and usage

There are basically two ways to run and configure this discord bot:

* as a docker container
* as a plain nodejs app

### Start the bot

#### Run as a docker conatiner

The easiest method to install and use this bot is by running it in a docker container. I suggest to use docker-compose
for that, however, starting the container with `docker run` should be fine as well.

```yaml
version: "3"

services:
  serviceName:
    image: droidwiki/cftools-discord
    restart: unless-stopped
    volumes:
      - ./config.json:/app/config.json
    # You need more configuration here, look at the Configuration section
```

You can run as many containers as you want, one container per game server you want to track.

#### Run on Heroku

The bot natively supports to be deployed on Heroku.
However, because of how Heroku works, you need to do some manual steps for your first-time setup as well.
Follow this guide to deploy the bot on Heroku.
The guide assumes you've installed the heroku cli, as well as git already.
Follow [the Heroku guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) to setup your local environment if you did not do that already.

1. Clone this repository: `git clone https://github.com/FlorianSW/cftools-discord.git`
2. Create a heroku app: `heroku create`
3. Add a `config.json` configuration file (e.g. by copying the `config.example.json` file) and configure as needed (see below)
4. Add the `config.json` to the git repository: `git add -f config.json` (you need to use the `-f` parameter as the config file is ignored)
5. Commit the configuration changes: `git commit -m 'Add bot configuration'`
6. Push the app to heroku: `git push heroku main`
7. Go to the Heroku dashboard and open the newly created app
8. Navigate to the `Resources` tab
9. Disable the `web` dyno and enable the `worker` dyno

#### Run as a plain nodejs app

You can also clone this repository, build the project on your own and start the resulting JavaScript code directly. You
need to have `nodejs` as well as `npm` installed.

* Clone the repository: `git clone https://github.com/FlorianSW/cftools-discord.git`
* Change to the cloned repository: `cd cftools-discord`
* Build the project: `npm ci && npm run build`
* Start the bot: `npm start`
* Configure the bot with the necessary configuration

### Configure the bot

The bot uses a configuration file in JSON, which path can be specified with the `CONFIG_FILE` environment variable.
When running the bot with the official docker image, this environment variable is pre-set to `/app/config.json`, the easiest would be to mount/bind a local configuration file to this path.

The contents of the JSON file can be taken from the example (`config.example.json`) of this repository.

#### Configuring servers

In the configuration file, there's a section `servers` where you can configure one or multiple servers the bot should serve.
The application you configured with the `cftools` configuration needs to have a grant to all servers you specify in this `servers` section.

Each server required a `name`, which is used by your users when talking with the bot, so keep it short to ensure a good experience for your community.

You can configure available commands for each server with the `commands` property.
It is an object where the key is the lowercase command the user will use as a discord application command, and the value is the configuration of the command (if any), or an empty object.
Check the list of available commands to know what commands you can use as the key in this configuration.
To disable a command, simply remove the command from the object.

#### Available commands

Currently, the following commands are available:

* `haspriority`: Checks if the provided Steam ID has an entry in the priority queue list of the server.

  _Possible responses_:
  * Message that the player with the steam ID does not have priority queue for the server
  * Message indicating that the player has priority queue for the server and the date when it expires
  * Message indicating that the player has priority queue for the server and that it never expires

* `leaderboard`: Returns a leaderboard of most kills for the specified server.

  _Possible responses_:
  * A leaderboard with up to 7 leaderboard entries, sorted descending starting with the player with the most kills.
    Shows kills and deaths for each player as well.
  * A message indicating that there is no data available to generate the leaderboard (used when CFTools Cloud did not return a leaderboard)
  <br>
    
  _Configuration options_:
  * `defaultStat`: The statistic that should be used to render the leaderboard when the user did not request a specific one
  * `allowedStats`: An array of available/allowed statistics.
    This list needs to contain only known statistic values (see the example config for available ones).
    If the user requests a statistic, which is not listed in this allow-list, no leaderboard will be rendered.
  * `numberOfPlayers`: The number of maximal entries rendered in the leaderboard (defaults to 7).

* `details`: Prints some general server information, like the current time, players online, etc.

  _Possible responses_:
  * A panel with a summary of available, general information about the server
  * An error message explaining that the server could not be found in CFTools Cloud
  <br>

* `playerstats`: Prints statistics about the player associated with the provides Steam ID.

  _Possible responses_:
  * A panel with a summary of available statistics about the player
  * An error message explaining that the Steam ID could not be found in CFTools Cloud
  <br>

### Setting the presence/activity in discord

If you want the bot to manage the presence/activity of the bot user within your discord, you may enable it with the `discord.presence` setting.
The default is `false`, which disables this feature and therefore allows potential other bots to use this activity (e.g. to display the current player count on a server).

To enable this feature, configure it like in this example:

```json
{
  // ...
  "discord": {
    // ...
    "presence": {
      "type": "WATCHING",
      "text": "go2tech.de"
    }
  }
}
```

The `type` can be any valid type for a discord presence, at the time of this writing one of:
- PLAYING
- STREAMING
- LISTENING
- WATCHING
- CUSTOM_STATUS
- COMPETING

While the `text` parameter is a freetext field (which may get truncated by discord if to long).

## Usage

The bot registers all available commands (of all servers) as discord slash commands (also known as application commands or simply commands).
A user can interact with them by typing a `/` and selecting the desired command. The required and optional parameters for that specific command will be shown and requested by discord before the user can send the command to get a response.

Slash commands can not be used by everyone. Make sure that you give the roles and users who should be able to use slash commands the necessary rights (either on a specific channel or for your whole guild.

## Show the player count of the server in the status of the bot

This bot itself _does not_ have a feature to show the count of currently active players on the server in the Bot status (activity).
It would also not work in a multi-server setup (where this bot serves multiple different servers).
If you want to show the player count of your server in the discord bot, take a look into my [Discord Player Count bot](https://github.com/FlorianSW/discord-player-count-bot).
It supports several sources for the player count, including CFTools Cloud.

# Contributions

If a feature, command or something is missing, feel free to open an issue or even a pull request :)
