const { Client, PermissionFlagsBits} = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const schedule = require('node-schedule');
const fs = require('fs');
const Logger = require('./Logger');
const {GatewayIntentBits} = require("discord-api-types/v10");

module.exports = class Judy {
    constructor() {
        this._client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        try {
            this._client.config = require('../config.json');
        } catch (e) {
            console.error("Cannot retrieve config file, please create a config.json file");
            process.exit(1);
        }
    }

    async bootstrap() {
        this._client.saveConfig = this.saveConfig;
        this._client.logger = new Logger();
        this._client._commands = new Map();
        this._client._state = {
            tempChannels: new Map(),
            tempChannelsCounters: new Map(),
            twitch: {
                prevState: null,
                scheduledEvent: null
            }
        }

        this._client.logger.info("Loading events...");
        this.registerEvents();

        this._client.logger.info("Loading slash commands...");
        await this.registerCommands();

        this._client.logger.info("Logging in...");
        await this._client.login(this._client.config.bot.token);

        this._client.logger.info("Loading scheduled tasks...");
        this.scheduleTasks();
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

    scheduleTasks() {
        fs.readdirSync('./scheduled').forEach(file => {
            const scheduledTask = require(`../scheduled/${file}`),
                name = file.split('.')[0];

            schedule.scheduleJob(scheduledTask.schedule, () => {
                try {
                    scheduledTask.task(this._client);
                } catch (e) {
                    console.error(e);
                }
            });

            this._client.logger.debug(`Loaded ${name} scheduled task.`);
            delete require.cache[require.resolve(`../scheduled/${file}`)];
        });
    }

    async saveConfig() {
        fs.writeFile('./config.json', JSON.stringify(this.config, null, 4), (err) => {
            if(err)
                console.error(err);
        });
    }

    async registerCommands() {
        const rest = new REST({version: '10'}).setToken(this._client.config.bot.token);
        const commandsData = [];

        fs.readdirSync('./commands').forEach(file => {
            const command = require(`../commands/${file}`),
                name = file.split('.')[0];

            if(!this._client.config.commands.includes(name))
                return;

            this._client._commands.set(name, command.handleInteraction);
            commandsData.push(command.init(new SlashCommandBuilder().setName(name), PermissionFlagsBits).toJSON());
        });

        this._client.logger.debug(`Refreshing commands: ${Array.from(this._client._commands.keys()).join(', ')}`);
        await rest.put(
            Routes.applicationGuildCommands(
                this._client.config.bot.clientId,
                this._client.config.bot.guildId
            ),
            {body: commandsData}
        );

        this._client.logger.debug("Done refreshing commands.");
    }
}
