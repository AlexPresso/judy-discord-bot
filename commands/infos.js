const EmbedUtils = require('../utils/EmbedUtils');

module.exports = {
    enabled: true,
    init: (builder) => {
        return builder.setDescription('Affiche les informations du bot.');
    },
    handleInteraction: (client, interaction) => {
        const embed = EmbedUtils.defaultEmbed()
            .setThumbnail(client.user.avatarURL())
            .setTitle("Infos")
            .setDescription(`${client.user.username} a été développée par <@168436075058954240> en utilisant la librairie [DiscordGo](https://github.com/bwmarrin/discordgo)`)

        interaction.reply({embeds: [embed]});
    }
}
