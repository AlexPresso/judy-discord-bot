package handlers

import (
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/spf13/viper"
)

func Ready(s *discordgo.Session, _ *discordgo.Ready) {
	utils.Info("Connected.")

	err := s.UpdateListeningStatus(viper.GetString("bot.status"))
	if err != nil {
		utils.ErrorEmbed("Cannot update status" + err.Error())
	}
}
