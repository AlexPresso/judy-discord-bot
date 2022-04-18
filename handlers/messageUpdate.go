package handlers

import (
	"fmt"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
)

func MessageUpdate(s *discordgo.Session, message *discordgo.MessageUpdate) {
	go func() {
		before := ""
		if message.BeforeUpdate != nil {
			before = message.BeforeUpdate.Content
		}

		if message.Content == before {
			return
		}

		embed := utils.MessageWithTitleAndAuthor("Message modifié", fmt.Sprintf("%s a modifié un message", message.Author.Mention()), message.Author)
		if before != "" {
			embed.Fields = append(embed.Fields, &discordgo.MessageEmbedField{
				Name:   "Avant",
				Value:  fmt.Sprintf("`%s`", before),
				Inline: false,
			})
		}

		embed.Fields = append(embed.Fields, &discordgo.MessageEmbedField{
			Name:   "Après",
			Value:  fmt.Sprintf("`%s`", message.Content),
			Inline: false,
		})

		utils.SendModMessage(s, &discordgo.MessageSend{
			Embed: embed,
		})
	}()
}
