module.exports = async client => {
    client.logger.success("Bot ready !");
    client.user.setPresence({
       status: 'online',
       activities: [
           {
               type: "LISTENING",
               name: "/infos"
           }
       ]
    });
}
