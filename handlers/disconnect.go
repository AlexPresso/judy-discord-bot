package handlers

import (
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
)

func Disconnect(s *discordgo.Session, _ *discordgo.Disconnect) {
	utils.Info("Lost connection to discord.")
}
