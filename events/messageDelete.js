const EmbedUtils = require('../utils/EmbedUtils');

module.exports = async (client, message) => {
    if(!message.content)
        return;

    const embed = EmbedUtils.messageWithTitleAndAuthor(
        "Message supprimé",
        `${message.author} a supprimé un message`,
        message.author
    ).addFields([
        {
            name: "Contenu du message",
            value: `\`${message.content}\``,
            inline: false
        }
    ]);

    message.guild.channels.resolve(client.config.modChannel)?.send({embeds: [embed]});
}
