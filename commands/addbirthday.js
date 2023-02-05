const EmbedUtils = require('../utils/EmbedUtils');

module.exports = {
    enabled: true,
    init: (builder, permissions) => {
        return builder.setDescription('Ajouter un anniversaire.')
            .addUserOption(o => o.setName('utilisateur').setDescription('utilisateur').setRequired(true))
            .addNumberOption(o => o.setName('jour').setDescription('jour').setRequired(true))
            .addNumberOption(o => o.setName('mois').setDescription('mois').setRequired(true))
            .setDefaultMemberPermissions(permissions.ManageChannels)
            .setDMPermission(false);
    },
    handleInteraction: async (client, interaction) => {
        const user = interaction.options.getUser('utilisateur'),
            day = String(interaction.options.getNumber('jour')).padStart(2, '0'),
            month = String(interaction.options.getNumber('mois')).padStart(2, '0');

        if(!Date.parse(`2023-${month}-${day}`))
            return interaction.reply({embeds: [
                EmbedUtils.errorEmbed(`\`${day}-${month}\` est un jour-mois incorrect.`)
            ]});

        let entries = client.config.birthdays.dates[`${month}-${day}`] || [];

        if(entries.includes(user.id))
            return interaction.reply({embeds: [
                EmbedUtils.errorEmbed(`L'anniversaire de ${user} est déjà enregistré.`)
            ]});

        entries = [user.id, ...entries];
        client.config.birthdays.dates[`${month}-${day}`] = entries;
        await client.saveConfig();

        interaction.reply({embeds: [
            EmbedUtils.successEmbed(`L'anniversaire de ${user} a été ajouté au \`${day}-${month}\``)
        ]});
    }
}
