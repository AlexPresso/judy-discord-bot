package utils

import (
	"github.com/bwmarrin/discordgo"
	"github.com/spf13/viper"
)

func SendModMessage(s *discordgo.Session, send *discordgo.MessageSend) {
	if _, err := s.ChannelMessageSendComplex(viper.GetString("modChannel"), send); err != nil {
		Error("Cannot send message: " + err.Error())
	}
}
