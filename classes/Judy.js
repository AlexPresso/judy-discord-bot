const { Client, Intents} = require('discord.js');
const fs = require('fs');
const Config = require('../config.json');
const Logger = require('./Logger');

module.exports = class Judy {
    constructor() {
        this._client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MEMBERS
            ]
        });
    }

    async bootstrap() {
        this._client.config = Config;
        this._client.logger = new Logger();
        this._client._state = {
            tempChannels: new Map(),
            tempChannelsCounters: new Map()
        }

        this._client.logger.info("Loading events...");
        this.registerEvents();

        this._client.logger.info("Logging in...");
        await this._client.login(Config.bot.token);
    }

    registerEvents() {
        fs.readdirSync('./events').forEach(file => {
            const event = require(`../events/${file}`),
                name = file.split('.')[0];

            this._client.on(name, event.bind(null, this._client));
            this._client.logger.debug(`Loaded ${name} event.`);
            delete require.cache[require.resolve(`../events/${file}`)];
        });
    }
}
