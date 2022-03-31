package bootstrap

import (
	H "github.com/alexpresso/judy/handlers"
	"github.com/alexpresso/judy/structures"
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

	state := structures.NewBotState()

	sess.Identify.Intents = discordgo.IntentsGuilds |
		discordgo.IntentsGuildVoiceStates |
		discordgo.IntentsGuildMembers |
		discordgo.IntentsGuildMessages

	sess.AddHandler(H.Connect)
	sess.AddHandler(H.Ready)
	sess.AddHandler(H.Disconnect)
	sess.AddHandler(H.VoiceStateUpdate(state))

	if err = sess.Open(); err != nil {
		log.Fatal(err)
	}

	return
}
