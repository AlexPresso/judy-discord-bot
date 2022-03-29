package bootstrap

import (
	H "github.com/alexpresso/judy/handlers"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
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
		discordgo.IntentsGuildMessages

	sess.AddHandler(H.Connect)
	sess.AddHandler(H.Ready)
	sess.AddHandler(H.Disconnect)
	sess.AddHandler(H.VoiceStateUpdate)

	err = sess.Open()
	if err != nil {
		log.Fatal(err)
	}

	return
}
