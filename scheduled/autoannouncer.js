module.exports = {
    schedule: "* * * * *",
    task: async client => {
        const announces = client.persistentData.autoannouncer || [],
            now = new Date();

        for (const announce of announces) {
            const cronTime = announce.cronTime;

            try {
                if(announce.sentAt && announce.deleteAfter && announce.messageId) {
                    if(now.getTime() - announce.sentAt >= announce.deleteAfter) {
                        const channel = await client.channels.resolve(announce.channelId);
                        const message = await channel.messages.fetch(announce.messageId);

                        await message.delete();

                        announce.sentAt = null;
                        announce.messageId = null;
                        await client.savePersistentData();
                    }
                }

                const [minutes, hours, , , dayOfWeek] = cronTime.split(' ');

                if (
                    parseInt(minutes, 10) === now.getMinutes() &&
                    parseInt(hours, 10) === now.getHours() &&
                    parseInt(dayOfWeek, 10) === now.getDate()
                ) {
                    const message = await client.channels.cache.get(announce.channelId)?.send(announce.message);
                    if(message) {
                        announce.sentAt = now.getTime();
                        announce.messageId = message.id;

                        await client.savePersistentData();
                    }
                }
            } catch (err) {
                console.error("Invalid cron expression:", cronTime, err);
            }
        }
    }
}
