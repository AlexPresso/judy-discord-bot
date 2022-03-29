package handlers

import (
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/spf13/viper"
)

func Ready(s *discordgo.Session, _ *discordgo.Ready) {
	utils.Info("Connected.")

	if err := s.UpdateListeningStatus(viper.GetString("bot.status")); err != nil {
		utils.Error("Cannot update status" + err.Error())
	}
}
