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
