# CFTools Cloud Discord bot

[![Docker Pulls](https://img.shields.io/docker/pulls/droidwiki/cftools-discord?style=flat-square)](https://hub.docker.com/r/droidwiki/cftools-discord)
[![Discord](https://img.shields.io/discord/729467994832371813?color=7289da&label=Discord&logo=discord&logoColor=ffffff&style=flat-square)](https://go2tech.de/discord)

...

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

#### Run as a plain nodejs app

You can also clone this repository, build the project on your own and start the resulting JavaScript code directly. You
need to have `nodejs` as well as `npm` installed.

* Clone the repository: `git clone https://github.com/FlorianSW/cftools-discord.git`
* Change to the cloned repository: `cd cftools-discord`
* Build the project: `npm ci && npm run build`
* Start the bot: `node dist/index.js`
* Configure the bot with the necessary configuration

### Configure the bot

The bot uses a configuration file in JSON, which path can be specified with the `CONFIG_FILE` environment variable.
When running the bot with the official docker image, this environment variable is pre-set to `/app/config.json`, the easiest would be to mount/bind a local configuration file to this path.

The contents of the JSON file can be taken from the example (`config.example.json`) of this repository.

#### Configuring servers

In the configuration file, there's a section `servers` where you can configure one or multiple servers the bot should serve.
The application you configured with the `cftools` configuration needs to have a grant to all servers you specify in this `servers` section.

Each server required a `name`, which is used by your users when talking with the bot, so keep it short to ensure a good experience for your community.

You can configure available commands for each server with the `commandMapping` property.
It is an object where the key is the command the user needs to type in when talking with the bot, and the value is the command the bot should execute then.
The value needs to be one of the available commands in the bot (see below for a list of available commands).
To disable a command, simply remove the command mapping from the object.

#### Available commands

Currently, the following commands are available:

* `hasPriority`: Checks if the provided Steam ID has an entry in the priority queue list of the server.

  _Required input_: `SteamID`, example: `@BotName ServerName hasPriority 76561198012102485`<br>
  _Possible responses_:
  * Message that the player with the steam ID does not have priority queue for the server
  * Message indicating that the player has priority queue for the server and the date when it expires
  * Message indicating that the player has priority queue for the server and that it never expires

## Usage

Once configured and added your discord server, the bot can be used by writing message to it.
The basic format is as follows:

``@BotName [ServerName] command [...parameter]``

Where:
* `@BotName`: The name of the bot in your discord.
  Users have to mention the bot to interact with it.
  It does, however, do not need to be at the beginning of the message, though.
* `ServerName`: The server name is the configured name of the server the users wants to have information of.
  This option helps to support multiple game servers in one discord without the need to run multiple bot instances.
  If you have only one server configured, you can omit the server name.
* `command`: The command from the command mapping of the server you want to execute.
* `...parameter`: 0 or more parameters for the command (like the Steam ID).
  See the command reference for available parameters.
