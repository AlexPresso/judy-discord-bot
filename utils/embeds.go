package utils

import (
	"fmt"
	"github.com/bwmarrin/discordgo"
	"github.com/lus/dgc"
	"github.com/spf13/viper"
	"time"
)

const (
	ColorDefault = 0x5352ed
	ColorRed     = 0xFF0000
	ColorGreen   = 0x7bed9f
)

func DefaultEmbed() *discordgo.MessageEmbed {
	return &discordgo.MessageEmbed{
		Color: ColorDefault,
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
	embed.Timestamp = time.Now().Format(time.RFC3339)
	return
}

func MessageWithTitleAndAuthor(title string, message string, user *discordgo.User) (embed *discordgo.MessageEmbed) {
	embed = MessageWithTitleEmbed(title, message)
	embed.Footer = &discordgo.MessageEmbedFooter{
		IconURL: user.AvatarURL("32"),
		Text:    user.Username,
	}
	return
}

func SuccessEmbed(message string) (embed *discordgo.MessageEmbed) {
	embed = MessageEmbed(message)
	embed.Color = ColorGreen
	return
}

func ErrorEmbed(message string) (embed *discordgo.MessageEmbed) {
	embed = MessageEmbed(message)
	embed.Color = ColorRed
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
			Value:  fmt.Sprintf("`%s`", cmd.Usage),
			Inline: true,
		},
		{
			Name:   "Exemple",
			Value:  fmt.Sprintf("`%s`", cmd.Example),
			Inline: true,
		},
	}

	return
}
