package utils

import (
	"github.com/bwmarrin/discordgo"
	"github.com/lus/dgc"
	"github.com/spf13/viper"
)

func DefaultEmbed() *discordgo.MessageEmbed {
	return &discordgo.MessageEmbed{
		Color: 0x5352ed,
	}
}

func MessageEmbed(message string) (embed *discordgo.MessageEmbed) {
	embed = DefaultEmbed()
	embed.Description = message
	return
}

func MessageWithTitleEmbed(title string, message string) (embed *discordgo.MessageEmbed) {
	embed = MessageEmbed(message)
	embed.Title = title
	return
}

func SuccessEmbed(message string) (embed *discordgo.MessageEmbed) {
	embed = MessageEmbed(message)
	embed.Color = 0x7bed9f
	return
}

func ErrorEmbed(message string) (embed *discordgo.MessageEmbed) {
	embed = MessageEmbed(message)
	embed.Color = 0xFF0000
	return
}

func CommandErrorPage(cmd *dgc.Command) (embed *discordgo.MessageEmbed) {
	embed = ErrorEmbed("Utilisation incorrecte de la commande `" + viper.GetString("prefix") + cmd.Name + "`")
	embed.Title = "Erreur"
	embed.Fields = []*discordgo.MessageEmbedField{
		{
			Name:   "Description",
			Value:  cmd.Description,
			Inline: false,
		},
		{
			Name:   "Usage",
			Value:  "`" + cmd.Usage + "`",
			Inline: true,
		},
		{
			Name:   "Exemple",
			Value:  "`" + cmd.Example + "`",
			Inline: true,
		},
	}

	return
}
