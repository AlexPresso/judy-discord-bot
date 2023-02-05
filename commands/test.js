module.exports = {
    enabled: false,
    init: (builder, _) => {
        return builder.setDescription('Affiche la liste des commandes.');
    },
    handleInteraction: (client, interaction) => {
        interaction.reply("test");
    }
}