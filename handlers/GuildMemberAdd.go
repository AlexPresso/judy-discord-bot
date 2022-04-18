package handlers

import (
	"fmt"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
)

func GuildMemberAdd(s *discordgo.Session, member *discordgo.GuildMemberAdd) {
	go func() {
		embed := utils.MessageWithTitleAndAuthor("", fmt.Sprintf("%s a rejoint le serveur.", member.Mention()), member.User)
		embed.Color = utils.ColorRed

		utils.SendModMessage(s, &discordgo.MessageSend{
			Embed: embed,
		})
	}()
}
