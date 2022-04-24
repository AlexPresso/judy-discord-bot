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

	sess.State.MaxMessageCount = viper.GetInt("bot.cachedMessagesCount")
	sess.Identify.Intents = discordgo.IntentsGuilds |
		discordgo.IntentsGuildVoiceStates
	//discordgo.IntentsGuildMessages |
	//discordgo.IntentsMessageContent |
	//discordgo.IntentsGuildMembers

	sess.AddHandler(H.Connect)
	sess.AddHandler(H.Ready)
	sess.AddHandler(H.Disconnect)
	sess.AddHandler(H.MessageUpdate)
	sess.AddHandler(H.MessageDelete)
	sess.AddHandler(H.GuildMemberAdd)
	sess.AddHandler(H.GuildMemberRemove)
	sess.AddHandler(H.VoiceStateUpdate(state))

	if err = sess.Open(); err != nil {
		log.Fatal(err)
	}

	return
}
