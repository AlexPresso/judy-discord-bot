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

        let replaced = false;
        for(const [date, userIds] of Object.entries(client.config.birthdays.dates)) {
            if(userIds.includes(user.id)) {
                client.config.birthdays.dates[date] = userIds.filter(id => id !== user.id);
                replaced = true;
                break;
            }
        }

        const previous = client.config.birthdays.dates[`${month}-${day}`] || [];
        client.config.birthdays.dates[`${month}-${day}`] = [user.id, ...previous];
        await client.saveConfig();

        interaction.reply({embeds: [
            EmbedUtils.successEmbed(`L'anniversaire de ${user} a été ${replaced ? "déplacé" : "ajouté" } au \`${day}-${month}\``)
        ]});
    }
}
