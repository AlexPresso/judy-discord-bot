module.exports = {
    enabled: false,
    init: (builder) => {
        return builder.setDescription('Affiche la liste des commandes.');
    },
    handleInteraction: (client, interaction) => {
        interaction.reply("test");
    }
}