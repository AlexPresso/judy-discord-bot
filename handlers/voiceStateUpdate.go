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

	user, err := s.User(newState.UserID)
	if err != nil {
		utils.Error("Error while fetching user: " + err.Error())
		return
	}

	channel, err := s.GuildChannelCreateComplex(newState.GuildID, discordgo.GuildChannelCreateData{
		Name:     "🔊 " + user.Username,
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
		utils.Error("Error while creating voice channel: " + err.Error())
		return
	}

	if err = s.GuildMemberMove(newState.GuildID, newState.UserID, &channel.ID); err != nil {
		utils.Error("Error while moving member: " + err.Error())
	}
}

func voiceLeft(s *discordgo.Session, oldState *discordgo.VoiceState) {
	channel, err := s.Channel(oldState.ChannelID)
	if err != nil {
		utils.Error("Error fetching channel: " + err.Error())
		return
	}

	parentId := viper.GetString(fmt.Sprintf("createVoiceChannels.%s", channel.ID))

	if channel.Type == discordgo.ChannelTypeGuildVoice && parentId == "" {
		guild, err := s.State.Guild(oldState.GuildID)
		if err != nil {
			utils.Error("Error fetching guild: " + err.Error())
			return
		}

		if userCount := getVoiceUserCount(guild, channel.ID); userCount == 0 {
			if _, err = s.ChannelDelete(oldState.ChannelID); err != nil {
				utils.Error("Error deleting channel: " + err.Error())
			}
		}
	}
}

func voiceChannelChanged(s *discordgo.Session, oldState *discordgo.VoiceState, newState *discordgo.VoiceState) {
	voiceLeft(s, oldState)
	voiceJoined(s, newState)
}

func getVoiceUserCount(guild *discordgo.Guild, channel string) (count int) {
	count = 0

	for _, state := range guild.VoiceStates {
		if state.ChannelID == channel {
			count++
		}
	}

	return
}
