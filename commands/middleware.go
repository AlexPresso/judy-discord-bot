package commands

import (
	"github.com/caillouxetbatons/discord-bot/utils"
	"github.com/lus/dgc"
	"github.com/spf13/viper"
)

func PermissionMiddleware(following dgc.ExecutionHandler) dgc.ExecutionHandler {
	return func(ctx *dgc.Ctx) {
		if utils.IsOwner(ctx.Event.Author) {
			following(ctx)
			return
		}

		if ctx.Event.ChannelID != viper.GetString("cmdChannel") {
			return
		}

		if !utils.CanRunCommand(ctx.Command.Flags, ctx.Event.Member, ctx.Event.Author.ID) {
			_ = ctx.RespondEmbed(utils.ErrorEmbed("Vous n'avez pas la permission d'éxécuter cette commande."))
			return
		}

		following(ctx)
	}
}
