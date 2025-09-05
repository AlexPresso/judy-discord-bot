const crypto = require('crypto');
const EmbedUtils = require('../utils/EmbedUtils');

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
                    .addChoices(
                        { name: 'Monday', value: 1 },
                        { name: 'Tuesday', value: 2 },
                        { name: 'Wednesday', value: 3 },
                        { name: 'Thursday', value: 4 },
                        { name: 'Friday', value: 5 },
                        { name: 'Saturday', value: 6 },
                        { name: 'Sunday', value: 0 },
                    )
                ).addStringOption(o => o.setName('heure')
                    .setDescription("Heure de l'annonce (format 24h, ex: 14:30)")
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
                let displayMessage = `#${channelName} ${a.message}`;
                if (displayMessage.length > 50)
                    displayMessage = displayMessage.slice(0, 47) + '...';

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

function isValidTime(time) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
}

function timeToCron(dayOfWeek, time) {
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
    if (!match)
        throw new Error("time must be in HH:MM 24-hour format");

    return `${match[2]} ${match[1]} * * ${dayOfWeek || "*"}`;
}

async function addAnnounce(client, interaction) {
    const channel = interaction.options.getChannel('salon'),
        message = interaction.options.getString('message'),
        day = interaction.options.getNumber('jour'),
        time = interaction.options.getString('heure') || "00:00";

    if(time && !isValidTime(time))
        return interaction.reply({embeds: [
            EmbedUtils.errorEmbed(`L'heure ${time} n'est pas correcte et doit être entre 00:00 et 23:59`)
        ]});

    const cronTime = timeToCron(day, time),
        existingAnnounces = client.persistentData.autoannouncer || [],
        newAnnounce = {uid: crypto.randomUUID(), message: message, channelId: channel.id, cronTime: cronTime};

    client.persistentData.autoannouncer = [
        ...existingAnnounces,
        newAnnounce
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
