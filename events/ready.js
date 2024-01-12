const {ActivityType} = require("discord-api-types/v10");

module.exports = async client => {
    client.logger.success("Bot ready !");
    client.user.setPresence({
       status: "online",
       activities: [
           {
               type: ActivityType.Listening,
               name: "/infos"
           }
       ]
    });
}
