module.exports = {
    init: (builder) => {
        return builder.setDescription('Affiche la liste des commandes.');
    },
    handleInteraction: (client, interaction) => {
        console.log("Interaction handled !!")
    }
}