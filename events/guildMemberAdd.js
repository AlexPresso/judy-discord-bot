const EmbedUtils = require('../utils/EmbedUtils');

module.exports = async (client, member) => {
    const embed = EmbedUtils.messageWithTitleAndAuthor(
        "",
        `${member} a rejoint le serveur (${member.guild.memberCount} membres).`,
        member
    ).setColor(EmbedUtils.colorGreen);

    member.guild.channels.resolve(client.config.modChannel)?.send({embeds: [embed]});
}
