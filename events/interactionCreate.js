module.exports = async (client, interaction) => {
    if(!interaction.isAutocomplete() && !interaction.isCommand())
        return;
    if(!client._commands.has(interaction.commandName))
        return;

    const command = client._commands.get(interaction.commandName);
    return interaction.isAutocomplete() ?
        command.autocomplete(client, interaction) :
        command.handleInteraction(client, interaction);
}