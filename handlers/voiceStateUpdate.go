package handlers

import (
	"fmt"
	"github.com/alexpresso/judy/structures"
	"github.com/alexpresso/judy/utils"
	"github.com/bwmarrin/discordgo"
	"github.com/spf13/viper"
)

func VoiceStateUpdate(botState *structures.BotState) func(s *discordgo.Session, update *discordgo.VoiceStateUpdate) {
	return func(s *discordgo.Session, update *discordgo.VoiceStateUpdate) {
		go func() {
			oldState := update.BeforeUpdate
			newState := update.VoiceState

			if oldState != newState {
				if oldState == nil {
					voiceJoined(s, newState, botState)
				} else if newState.ChannelID == "" {
					voiceLeft(s, oldState, botState)
				} else {
					voiceChannelChanged(s, oldState, newState, botState)
				}
			}
		}()
	}
}

func voiceJoined(s *discordgo.Session, newState *discordgo.VoiceState, botState *structures.BotState) {
	parentId := viper.GetString(fmt.Sprintf("createVoiceChannels.%s", newState.ChannelID))
	if parentId == "" {
		return
	}

	permissions := []*discordgo.PermissionOverwrite{
		{
			Type:  discordgo.PermissionOverwriteTypeMember,
			ID:    newState.UserID,
			Allow: discordgo.PermissionManageChannels,
		},
	}

	if parent, err := s.Channel(parentId); err == nil {
		permissions = append(permissions, parent.PermissionOverwrites...)
	} else {
		utils.Error("Error while fetching category: " + err.Error())
		return
	}

	user, err := s.User(newState.UserID)
	if err != nil {
		utils.Error("Error while fetching user: " + err.Error())
		return
	}

	channel, err := s.GuildChannelCreateComplex(newState.GuildID, discordgo.GuildChannelCreateData{
		Name:                 "🔊 " + user.Username,
		Type:                 discordgo.ChannelTypeGuildVoice,
		ParentID:             parentId,
		PermissionOverwrites: permissions,
	})

	if err != nil {
		utils.Error("Error while creating voice channel: " + err.Error())
		return
	}

	botState.TempVoiceChannels[channel.ID] = ""

	if err = s.GuildMemberMove(newState.GuildID, newState.UserID, &channel.ID); err != nil {
		utils.Error("Error while moving member: " + err.Error())
	}
}

func voiceLeft(s *discordgo.Session, oldState *discordgo.VoiceState, botState *structures.BotState) {
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

		if userCount := getVoiceUserCount(guild, channel.ID); userCount == 0 && botState.TempVoiceChannels[channel.ID] != nil {
			if _, err = s.ChannelDelete(oldState.ChannelID); err == nil {
				delete(botState.TempVoiceChannels, channel.ID)
			} else {
				utils.Error("Error deleting channel: " + err.Error())
			}
		}
	}
}

func voiceChannelChanged(s *discordgo.Session, oldState *discordgo.VoiceState, newState *discordgo.VoiceState, botState *structures.BotState) {
	voiceLeft(s, oldState, botState)
	voiceJoined(s, newState, botState)
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
