const { EmbedBuilder, GuildMember} = require('discord.js');


module.exports = class EmbedUtils {
    static colorDefault = 0x5352ed;
    static colorRed = 0xFF0000;
    static colorGreen = 0x7bed9f;

    static defaultEmbed() {
        return new EmbedBuilder().setColor(EmbedUtils.colorDefault);
    }

    static messageEmbed(message) {
        return EmbedUtils.defaultEmbed().setDescription(message);
    }

    static messageWithTitleEmbed(title, message) {
        return EmbedUtils.messageEmbed(message)
            .setTitle(title)
            .setTimestamp(Date.now());
    }

    static messageWithTitleAndAuthor(title, message, user) {
        if(user instanceof GuildMember)
            user = user.user;

        return EmbedUtils.messageWithTitleEmbed(title, message).setFooter({
            text: user.username,
            iconURL: user.avatarURL()
        });
    }

    static messageWithAuthor(message, user) {
        if(user instanceof GuildMember)
            user = user.user;

        return EmbedUtils.messageEmbed(message).setFooter({
            text: user.username,
            iconURL: user.avatarURL()
        });
    }

    static successEmbed(message) {
        return EmbedUtils.messageEmbed(message).setColor(EmbedUtils.colorGreen);
    }

    static errorEmbed(message) {
        return EmbedUtils.messageEmbed(message).setColor(EmbedUtils.colorRed);
    }
}
