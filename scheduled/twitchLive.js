const Twitch = require('../utils/TwitchAPI');
const EmbedUtils = require('../utils/EmbedUtils');
const {GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel} = require("discord-api-types/v10");

module.exports = {
    schedule: "0 * * * * *",
    task: async client => {
        const config = client.config.twitch || {};
        if(!config.channel)
            return;

        const token = await Twitch.getToken(config.clientId, config.clientSecret)
        if(!token)
            return;

        const response = await Twitch.getStreams(config.clientId, [config.channel], token.data.access_token);
        if(!response)
            return;

        const newState = response.data.data[0];
        const oldState = client._state.twitch.prevState;
        const manager = client.guilds.resolve(client.config.bot.guildId)?.scheduledEvents;
        const previousEvent = await getOrFetchPreviousEvent(client, manager);

        if(!oldState && newState) {
            startOrEditLiveEvent(client, newState, manager, previousEvent);
            notifyLiveStart(client, newState);
        } else if(oldState && !newState) {
            stopLiveEvent(client, oldState);
        } else {
            startOrEditLiveEvent(client, newState, manager, previousEvent);
        }

        client._state.twitch.prevState = newState;
    }
}

async function notifyLiveStart(client, state) {
    client.channels.resolve(client.config.twitch.discordChannel)?.send({
        message: `@everyone https://twitch.tv/${client.config.twitch.channel}`
    });
}

async function startOrEditLiveEvent(client, state, manager, previousEvent) {
    const date = new Date();
    const image = await Twitch.getThumbnail(state.thumbnail_url, 800, 400);

    const options = {
        name: client.config.twitch.message.replaceAll("%userName%", "Alex'Presso"),
        description: state.title,
        image: Buffer.from(image.data, "utf-8"),
        scheduledEndTime: date.setDate(date.getDate() + 1),
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        entityMetadata: {
            location: `https://twitch.tv/${client.config.twitch.channel}`
        }
    };

    client._state.twitch.scheduledEvent = await previousEvent ?
        manager.edit(previousEvent, options) :
        manager.create({
            scheduledStartTime: date.setSeconds(date.getSeconds() + 2),
            ...options
        });
}

async function stopLiveEvent(client, manager, previousEvent) {
    if(!previousEvent)
        return;

    manager.delete(previousEvent);
    client._state.twitchPrevState = null;
}

async function getOrFetchPreviousEvent(client, manager) {
    if(client._state.twitch.scheduledEvent)
        return client._state.twitch.scheduledEvent;

    for(const [_, event] of await manager.fetch()) {
        if(event.entityMetadata?.location?.includes("https://twitch.tv"))
            return event;
    }
}
