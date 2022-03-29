package bootstrap

import (
	"github.com/bwmarrin/discordgo"
	H "github.com/caillouxetbatons/discord-bot/handlers"
	"github.com/caillouxetbatons/discord-bot/utils"
	"github.com/spf13/viper"
	"log"
)

func InitializeBot() (sess *discordgo.Session) {
	utils.Info("Starting bot...")
	sess, err := discordgo.New("Bot " + viper.GetString("bot.token"))
	if err != nil {
		log.Fatal(err)
	}

	sess.Identify.Intents = discordgo.IntentsGuilds |
		discordgo.IntentsGuildVoiceStates |
		discordgo.IntentsGuildMembers |
		discordgo.IntentsMessageContent

	sess.AddHandler(H.Ready)
	sess.AddHandler(H.VoiceStateUpdate)

	err = sess.Open()
	if err != nil {
		log.Fatal(err)
	}

	return
}
