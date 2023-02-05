const EmbedUtils = require('../utils/EmbedUtils');

module.exports = {
    schedule: "0 1 0 * * *",
    task: async client => {
        const date = new Date(),
            day = String(date.getDate()).padStart(2, '0'),
            month = String(date.getMonth() + 1).padStart(2, '0')
        const birthdays = client.config.birthdays.dates[`${month}-${day}`] || [];

        for(const userId of birthdays) {
            const embed = EmbedUtils.messageWithTitleEmbed(
                client.config.birthdays.embed.title,
                client.config.birthdays.embed.message.replace('%userId%', userId)
            );

            client.channels.resolve(client.config.birthdays.channelId)?.send({content: '@everyone', embeds: [embed]});
        }
    }
}