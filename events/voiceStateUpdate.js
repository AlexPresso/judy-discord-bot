const { PermissionFlagsBits } = require("discord.js");

module.exports = async (client, oldState, newState) => {
    if(oldState.channelId === newState.channelId)
        return;

    if(oldState.channelId == null) {
        voiceJoined(client, newState);
    } else if (newState.channelId == null) {
        voiceLeft(client, oldState);
    } else {
        voiceJoined(client, newState);
        voiceLeft(client, oldState);
    }
}

async function voiceJoined(client, newState) {
    const parentId = client.config.createVoiceChannels[newState.channelId];
    if(!parentId)
        return;

    const number = getAvailableNumber(client._state.tempChannelsCounters, parentId);
    const channel = await newState.guild.channels.create(`🔊 Vocal N°${number}`, {
        parent: parentId,
        type: 'GUILD_VOICE',
        permissionOverwrites: [
            {
                id: newState.id,
                allow: [ PermissionFlagsBits.ManageChannels ]
            },
            ...newState.channel.parent.permissionOverwrites.cache.values()
        ]
    });

    client._state.tempChannels.set(channel.id, number);
    client._state.tempChannelsCounters.get(parentId).add(number);

    await newState.member.voice.setChannel(channel);
}

function voiceLeft(client, oldState) {
    if(!client._state.tempChannels.has(oldState.channelId))
        return;
    if(oldState.channel.members.size > 0)
        return;

    const number = client._state.tempChannels.get(oldState.channelId);

    client._state.tempChannelsCounters.get(oldState.channel.parent.id).delete(number);
    oldState.channel.delete();
}

function getAvailableNumber(maps, parentId) {
    if(!maps.has(parentId))
        maps.set(parentId, new Set());

    const set = maps.get(parentId);
    for(let i = 1; i < 255; i++) {
        if(!set.has(i))
            return i;
    }

    return 0;
}
