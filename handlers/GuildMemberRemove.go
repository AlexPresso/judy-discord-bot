package handlers

import (
	"fmt"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
)

func GuildMemberRemove(s *discordgo.Session, member *discordgo.GuildMemberRemove) {
	go func() {
		embed := utils.MessageWithTitleAndAuthor("", fmt.Sprintf("%s a quitté le serveur.", member.Mention()), member.User)
		embed.Color = utils.ColorGreen

		utils.SendModMessage(s, &discordgo.MessageSend{
			Embed: embed,
		})
	}()
}
