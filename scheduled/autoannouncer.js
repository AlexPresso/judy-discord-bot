module.exports = {
    schedule: "* * * * *",
    task: async client => {
        const announces = client.persistentData.autoannouncer || [],
            now = new Date();

        for (const announce of announces) {
            const cronTime = announce.cronTime;

            try {
                const [minutes, hours, , , dayOfWeek] = cronTime.split(' ');

                if (
                    parseInt(minutes, 10) === now.getMinutes() &&
                    parseInt(hours, 10) === now.getHours() &&
                    parseInt(dayOfWeek, 10) === now.getDate()
                ) {
                    client.channels.cache.get(announce.channelId)?.send(announce.message);
                }
            } catch (err) {
                console.error("Invalid cron expression:", cronTime, err);
            }
        }
    }
}
