const crypto = require('crypto');
const EmbedUtils = require('../utils/EmbedUtils');
const {days, isValidTime, timeToCron, cronToTime} = require("../utils/TimeUtils");

module.exports = {
    init: (builder, permissions) => {
        return builder.setDescription('Gérer les annonces automatiques')
            .setDefaultMemberPermissions(permissions.ManageChannels)
            .setDMPermission(false)
            .addSubcommand(s => s
                .setName("add")
                .setDescription("ajouter une annonce")
                .addChannelOption(o => o.setName("salon").setDescription("salon d'annonce").setRequired(true))
                .addStringOption(o => o.setName("message").setDescription("message d'annonce").setRequired(true))
                .addNumberOption(o => o.setName('jour')
                    .setDescription("jour de l'annonce")
                    .setRequired(false)
                    .addChoices(days)
                ).addStringOption(o => o.setName('heure')
                    .setDescription("Heure de l'annonce (format 24h, ex: 14:30)")
                    .setRequired(false)
                ).addNumberOption(o => o.setName('expiration')
                    .setDescription("durée (heures) après laquelle supprimer le message")
                    .setRequired(false)
                )
            ).addSubcommand(s => s
                .setName("remove")
                .setDescription("retirer une annonce")
                .addStringOption(o => o.setName('annonce').setDescription("l'annonce").setRequired(true).setAutocomplete(true))
            )
    },
    autocomplete: async (client, interaction) => {
        const focused = interaction.options.getFocused(true);

        interaction.respond((client.persistentData.autoannouncer || [])
            .filter(a => a.message.toLowerCase().includes(focused.value))
            .map(a => {
                const channelName = client.channels.resolve(a.channelId).name;
                const stringTime = cronToTime(a.cronTime);

                let displayMessage = `[${stringTime} - #${channelName}]: ${a.message}`;
                if (displayMessage.length > 100)
                    displayMessage = displayMessage.slice(0, 97) + '...';

                return {name: displayMessage, value: a.uid}
            })
        );
    },
    handleInteraction: async (client, interaction) => {
        if(interaction.options.getSubcommand() === "remove")
            return await removeAnnounce(client, interaction);

        await addAnnounce(client, interaction);
    }
}

async function addAnnounce(client, interaction) {
    const channel = interaction.options.getChannel('salon'),
        message = interaction.options.getString('message'),
        day = interaction.options.getNumber('jour'),
        time = interaction.options.getString('heure') || "00:00",
        expiry = interaction.options.getNumber('expiration') || null;

    if(time && !isValidTime(time))
        return interaction.reply({embeds: [
            EmbedUtils.errorEmbed(`L'heure ${time} n'est pas correcte et doit être entre 00:00 et 23:59`)
        ]});

    const cronTime = timeToCron(day, time),
        existingAnnounces = client.persistentData.autoannouncer || [];

    client.persistentData.autoannouncer = [
        ...existingAnnounces,
        {
            uid: crypto.randomUUID(),
            message: message,
            messageId: null,
            sentAt: null,
            channelId: channel.id,
            cronTime: cronTime,
            deleteAfter: expiry * 60 * 60 * 1000
        }
    ];

    await client.savePersistentData();

    interaction.reply({embeds: [EmbedUtils.successEmbed(`L'annonce a été ajoutée.`)]});
}

async function removeAnnounce(client, interaction) {
    const messageUid = interaction.options.getString('annonce');
    client.persistentData.autoannouncer = client.persistentData.autoannouncer.filter(m => m.uid !== messageUid);

    await client.savePersistentData();

    interaction.reply({embeds: [EmbedUtils.successEmbed("L'annonce a été supprimée.")]});
}
