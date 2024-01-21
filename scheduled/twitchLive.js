const Twitch = require('../utils/TwitchAPI');
const EmbedUtils = require('../utils/EmbedUtils');
const {GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel} = require("discord-api-types/v10");

module.exports = {
    schedule: "* * * * *",
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

        if(!newState && !oldState)
            return;

        const manager = client.guilds.resolve(client.config.bot.guildId)?.scheduledEvents;
        const previousEvent = await getOrFetchPreviousEvent(client, manager);

        if(!oldState && newState) {
            startOrEditLiveEvent(client, newState, manager, previousEvent);
            notifyLiveStart(client, newState);
        } else if(oldState && !newState) {
            stopLiveEvent(client, manager, previousEvent);
            postReplay(client, token.data.access_token);
        } else {
            startOrEditLiveEvent(client, newState, manager, previousEvent);
        }

        client._state.twitch.prevState = newState;
    }
}

async function notifyLiveStart(client, state) {
    const user = await client.users.fetch(client.config.bot.ownerId);
    const embed = EmbedUtils.defaultEmbed()
        .setAuthor({name: user.globalName, iconURL: user.avatarURL()})
        .setTitle(state.title)
        .setURL(`https://twitch.tv/${client.config.twitch.channel}`)
        .setTimestamp(Date.now())
        .setImage(state.thumbnail_url
            .replace("{width}", 1920)
            .replace("{height}", 1080)
        );

    client.channels.resolve(client.config.twitch.liveDiscordChannel)?.send({content: "@everyone", embeds: [embed]});
}

async function startOrEditLiveEvent(client, state, manager, previousEvent) {
    const end = new Date();
    const image = await Twitch.getThumbnail(state.thumbnail_url, 800, 400);
    const user = await client.users.fetch(client.config.bot.ownerId);

    const options = {
        name: client.config.twitch.message.replaceAll("%userName%", user.globalName),
        description: state.title,
        image: Buffer.from(image.data, "utf-8"),
        scheduledEndTime: end.setDate(end.getDate() + 1),
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        entityMetadata: {
            location: `https://twitch.tv/${client.config.twitch.channel}`
        }
    };

    client._state.twitch.scheduledEvent = previousEvent ?
        manager.edit(previousEvent, options) :
        manager.create({
            scheduledStartTime: Date.now() + 2000,
            ...options
        });
}

async function stopLiveEvent(client, manager, previousEvent) {
    if(!previousEvent)
        return;

    manager.delete(previousEvent);
    client._state.twitch.prevState = null;
}

async function postReplay(client, twitchToken)  {
    const videos = await Twitch.getVideos(
        client.config.twitch.userId,
        'archive',
        'day',
        client.config.twitch.clientId,
        twitchToken
    );

    if(!videos || !videos.data)
        return;

    client.channels.resolve(client.config.twitch.replayDiscordChannel)?.send(videos.data.data[0].url)
}

async function getOrFetchPreviousEvent(client, manager) {
    if(client._state.twitch.scheduledEvent)
        return client._state.twitch.scheduledEvent;

    for(const [_, event] of await manager.fetch()) {
        if(event.entityMetadata?.location?.includes(`https://twitch.tv/${client.config.twitch.channel}`))
            return event;
    }

    return null;
}
