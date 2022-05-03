module.exports = async (client, interaction) => {
    if(!interaction.isCommand())
        return;
    if(!client._commands.has(interaction.commandName))
        return;

    client._commands.get(interaction.commandName)(client, interaction);
}