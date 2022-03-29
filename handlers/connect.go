package handlers

import (
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
)

func Connect(s *discordgo.Session, _ *discordgo.Connect) {
	utils.Info("Connected to discord.")
}
