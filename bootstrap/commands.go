package bootstrap

import (
	C "github.com/alexpresso/judy/commands"
	"github.com/bwmarrin/discordgo"
	"github.com/lus/dgc"
	"github.com/spf13/viper"
)

func RegisterCommands(sess *discordgo.Session) {
	router := dgc.Create(&dgc.Router{
		Prefixes:    []string{viper.GetString("bot.prefix")},
		BotsAllowed: false,
		Commands: []*dgc.Command{
			&C.Help,
			&C.Infos,
		},
		Middlewares: []dgc.Middleware{C.PermissionMiddleware},
	})

	router.Initialize(sess)
}
