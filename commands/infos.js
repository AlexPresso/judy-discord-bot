const EmbedUtils = require('../utils/EmbedUtils');

module.exports = {
    init: (builder, _) => {
        return builder.setDescription('Affiche les informations du bot.');
    },
    handleInteraction: (client, interaction) => {
        const embed = EmbedUtils.defaultEmbed()
            .setThumbnail(client.user.avatarURL())
            .setTitle("Infos")
            .setDescription(`
                ${client.user.username} a été développée par <@168436075058954240> en utilisant la librairie [Discord.js](https://discord.js.org).\n
                Son code est open-source et disponible [ici](https://github.com/AlexPresso/judy-discord-bot).
            `)

        interaction.reply({embeds: [embed]});
    }
}
