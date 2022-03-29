package commands

import (
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/lus/dgc"
	"github.com/spf13/viper"
)

var Help = dgc.Command{
	Name:        "help",
	Description: "Affiche une liste des commandes",
	Usage:       "help",
	Example:     "help",
	IgnoreCase:  true,
	Handler: func(ctx *dgc.Ctx) {
		var commands = ""
		var descriptions = ""
		prefix := viper.GetString("prefix")

		for _, cmd := range ctx.Router.Commands {
			if utils.CanRunCommand(cmd.Flags, ctx.Event.Member, ctx.Event.Author.ID) {
				commands += "`" + prefix + cmd.Usage + "`\n"
				descriptions += cmd.Description + "\n"
			}
		}

		e := utils.DefaultEmbed()
		e.Title = "Liste des commandes"
		e.Fields = []*discordgo.MessageEmbedField{
			{
				Name:   "Commandes",
				Value:  commands,
				Inline: true,
			},
			{
				Name:   "Descriptions",
				Value:  descriptions,
				Inline: true,
			},
		}

		_ = ctx.RespondEmbed(e)
	},
}
