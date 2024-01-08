const Twitch = require('../utils/TwitchAPI');
const {GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel} = require("discord-api-types/v10");

module.exports = {
    schedule: "* * * * * *",
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
        const oldState = client._state.twitchPrevState;

        if(!oldState && newState) {
            liveStart(client, newState);
        } else if(oldState && !newState) {
            liveStop(client, oldState);
        } else {
            liveStop(client, oldState);
            liveStart(client, newState);
        }

        client._state.prevStreamState = newState;
    }
}

async function liveStart(client, state) {
    const date = new Date();
    const image = await Twitch.getThumbnail(state.thumbnail_url, 800, 400);

    client.guilds.resolve(client.config.bot.guildId)?.scheduledEvents.create({
        name: client.config.twitch.message.replaceAll("%userName%", "Alex'Presso"),
        description: state.title,
        image: Buffer.from(image.data, "utf-8"),
        scheduledStartTime: date.setSeconds(date.getSeconds() + 2),
        scheduledEndTime: date.setDate(date.getDate() + 1),
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        entityMetadata: {
            location: `https://twitch.tv/${client.config.twitch.channel}`
        }
    });
}

async function liveStop(client, state) {
    const manager = client.guilds.resolve(client.config.bot.guildId)?.scheduledEvents;
    const scheduledEvents = await manager.fetch();

    for(const [id, event] of scheduledEvents) {
        if(event.entityMetadata?.location?.includes("https://twitch.tv")) {
            manager.delete(event);
            client._state.twitchPrevState = null;
            return;
        }
    }
}
