const EmbedUtils = require("../utils/EmbedUtils");

module.exports = async (client, member) => {
    const embed = EmbedUtils.messageWithTitleAndAuthor(
        "",
        `${member} a quitté le serveur.`,
        member
    ).setColor(EmbedUtils.colorRed);

    client.channels.resolve(client.config.modChannel)?.send({embeds: [embed]});
}
