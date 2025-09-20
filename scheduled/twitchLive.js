const Twitch = require('../utils/TwitchAPI');
const EmbedUtils = require('../utils/EmbedUtils');
const {GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel} = require("discord-api-types/v10");

module.exports = {
    schedule: "* * * * *",
    task: async client => {
        const config = client.config.twitch || {},
            now = new Date();

        if(!config.channel || !config.enable)
            return;

        const token = await Twitch.getToken(config.clientId, config.clientSecret)
        if(!token)
            return;

        const response = await Twitch.getStreams(config.clientId, [config.channel], token.data.access_token);
        if(!response)
            return;

        await postClips(client, token.data.access_token, now);
        await client.savePersistentData();

        const newState = response.data.data[0];
        const oldState = client.getDataOrDefault("twitch.prevState", null);

        if(!newState && !oldState)
            return;

        const manager = client.guilds.resolve(client.config.bot.guildId)?.scheduledEvents;
        const previousEvent = await getOrFetchPreviousEvent(client, manager);

        if(!oldState && newState) {
            await startOrEditLiveEvent(client, newState, manager, previousEvent);
            await notifyLiveStart(client, newState);
        } else if(oldState && !newState) {
            await stopLiveEvent(client, manager, previousEvent);
            await postReplay(client, token.data.access_token);
        } else {
            await startOrEditLiveEvent(client, newState, manager, previousEvent);
        }

        client.setPersistentData("twitch.prevState", newState);
        await client.savePersistentData();
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

    const event = previousEvent ?
        manager.edit(previousEvent, options) :
        manager.create({
            scheduledStartTime: Date.now() + 2000,
            ...options
        });

    client.setPersistentData("twitch.scheduledEvent", event);
}

async function stopLiveEvent(client, manager, previousEvent) {
    if(!previousEvent)
        return;

    manager.delete(previousEvent);
    client.setPersistentData("twitch.prevState", null);
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

async function postClips(client, token, now) {
    const clips = await Twitch.getClips(
        client.config.twitch.userId,
        client.getDataOrDefault("twitch.lastExecTime", now.toISOString()),
        client.config.twitch.clientId,
        token
    );

    client.setPersistentData("twitch.lastExecTime", now.toISOString());
    if(!clips || !clips.data)
        return;

    for(const clip of (clips.data.data || [])) {
        client.channels.resolve(client.config.twitch.clipDiscordChannel)?.send(clip.url);
    }
}

async function getOrFetchPreviousEvent(client, manager) {
    if(client.getDataOrDefault("twitch.scheduledEvent", null))
        return client.persistentData.twitch.scheduledEvent;

    for(const [_, event] of await manager.fetch()) {
        if(event.entityMetadata?.location?.includes(`https://twitch.tv/${client.config.twitch.channel}`))
            return event;
    }

    return null;
}
