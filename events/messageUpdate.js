const EmbedUtils = require("../utils/EmbedUtils");
module.exports = async (client, oldMessage, newMessage) => {
    if(oldMessage.content === newMessage.content)
        return;

    const embed = EmbedUtils.messageWithTitleAndAuthor(
        "Message modifié",
        `${newMessage.author} a modifié un message`,
        newMessage.author
    ).addFields([
        {
            name: "Avant",
            value: `\`${oldMessage.content}\``,
            inline: false
        },
        {
            name: "Après",
            value: `\`${newMessage.content}\``,
            inline: false
        }
    ]);

    newMessage.guild.channels.resolve(client.config.modChannel)?.send({embeds: [embed]});
}
