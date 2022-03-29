package commands

import (
	"fmt"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/lus/dgc"
)

var Infos = dgc.Command{
	Name:        "infos",
	Description: "Affiche les informations du bot",
	Usage:       "infos",
	Example:     "infos",
	IgnoreCase:  true,
	Handler: func(ctx *dgc.Ctx) {
		botUser := ctx.Session.State.User

		e := utils.DefaultEmbed()
		e.Title = "Infos"
		e.Description = fmt.Sprintf("%s a été développée par <@168436075058954240> en utilisant la librairie [DiscordGo](https://github.com/bwmarrin/discordgo).", botUser.Username)
		e.Thumbnail = &discordgo.MessageEmbedThumbnail{
			URL: botUser.AvatarURL("256"),
		}

		_ = ctx.RespondEmbed(e)
	},
}
