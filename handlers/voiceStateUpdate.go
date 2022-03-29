package handlers

import (
	"fmt"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/spf13/viper"
)

func VoiceStateUpdate(s *discordgo.Session, update *discordgo.VoiceStateUpdate) {
	go func() {
		oldState := update.BeforeUpdate
		newState := update.VoiceState

		if oldState != newState {
			if oldState == nil {
				voiceJoined(s, newState)
			} else if newState.ChannelID == "" {
				voiceLeft(s, oldState)
			} else {
				voiceChannelChanged(s, oldState, newState)
			}
		}
	}()
}

func voiceJoined(s *discordgo.Session, newState *discordgo.VoiceState) {
	parentId := viper.GetString(fmt.Sprintf("createVoiceChannels.%s", newState.ChannelID))
	if parentId == "" {
		return
	}

	channel, err := s.GuildChannelCreateComplex(newState.GuildID, discordgo.GuildChannelCreateData{
		Name:     "🔊 ",
		Type:     discordgo.ChannelTypeGuildVoice,
		ParentID: parentId,
		PermissionOverwrites: []*discordgo.PermissionOverwrite{
			{
				Type:  discordgo.PermissionOverwriteTypeMember,
				ID:    newState.UserID,
				Allow: discordgo.PermissionManageChannels,
			},
		},
	})

	if err != nil {
		utils.ErrorEmbed("ErrorEmbed while creating voice channel: " + err.Error())
		return
	}

	if err = s.GuildMemberMove(newState.GuildID, newState.UserID, &channel.ID); err != nil {
		utils.ErrorEmbed("ErrorEmbed while moving member: " + err.Error())
	}
}

func voiceLeft(s *discordgo.Session, oldState *discordgo.VoiceState) {
	channel, err := s.Channel(oldState.ChannelID)
	if err != nil {
		utils.ErrorEmbed("ErrorEmbed fetching channel: " + err.Error())
		return
	}

	if channel.Type == discordgo.ChannelTypeGuildVoice && channel.MemberCount == 0 {
		if _, err = s.ChannelDelete(oldState.ChannelID); err != nil {
			utils.ErrorEmbed("ErrorEmbed deleting channel: " + err.Error())
		}
	}
}

func voiceChannelChanged(s *discordgo.Session, oldState *discordgo.VoiceState, newState *discordgo.VoiceState) {
	voiceLeft(s, oldState)
	voiceJoined(s, newState)
}
