package handlers

import (
	"fmt"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
)

func MessageDelete(s *discordgo.Session, message *discordgo.MessageDelete) {
	go func() {
		msg := message.BeforeDelete
		if msg == nil {
			msg = message.Message
		}

		if msg.Content == "" {
			return
		}

		embed := utils.MessageWithTitleAndAuthor("Message supprimé", fmt.Sprintf("%s a supprimé un message", msg.Author.Mention()), msg.Author)
		embed.Fields = []*discordgo.MessageEmbedField{
			{
				Name:   "Contenu du message",
				Value:  fmt.Sprintf("`%s`", msg.Content),
				Inline: false,
			},
		}

		utils.SendModMessage(s, &discordgo.MessageSend{
			Embed: embed,
		})
	}()
}
