package commands

import (
	"github.com/bwmarrin/discordgo"
	"github.com/caillouxetbatons/discord-bot/utils"
	"github.com/lus/dgc"
)

var Infos = dgc.Command{
	Name:        "infos",
	Description: "Affiche les informations du bot",
	Usage:       "infos",
	Example:     "infos",
	IgnoreCase:  true,
	Handler: func(ctx *dgc.Ctx) {
		e := utils.DefaultEmbed()
		e.Title = "Infos"
		e.Description = "Judy a été développée par <@168436075058954240> en utilisant la librairie [DiscordGo](https://github.com/bwmarrin/discordgo)."
		e.Thumbnail = &discordgo.MessageEmbedThumbnail{
			URL: ctx.Session.State.User.AvatarURL("256"),
		}

		_ = ctx.RespondEmbed(e)
	},
}
