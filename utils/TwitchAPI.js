const Axios = require("axios");

module.exports = {
    getToken: (clientId, clientSecret) => {
        return Axios.post(
            `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
            null
        ).catch(console.error);
    },

    getStreams: (clientId, channels, token) => {
        return Axios.get(
            `https://api.twitch.tv/helix/streams?user_login=${channels.join(',')}`,
            {
                headers: {
                    "Client-ID": clientId,
                    "Authorization": `Bearer ${token}`
                }
            }
        ).catch(console.error);
    },

    getThumbnail: (url, width, height) => {
        return Axios.get(url.replace("{width}", width).replace("{height}", height), {responseType: "arraybuffer"})
    },

    getVideos: (userId, type, period, clientId, token) => {
        return Axios.get(
            `https://api.twitch.tv/helix/videos?user_id=${userId}&type=${type}&period=${period}&sort=time`,
            {
                headers: {
                    "Client-ID": clientId,
                    "Authorization": `Bearer ${token}`
                }
            }
        ).catch(console.error)
    }
}
