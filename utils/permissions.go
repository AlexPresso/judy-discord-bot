package utils

import (
	"github.com/bwmarrin/discordgo"
	"github.com/spf13/viper"
)

func IsOwner(user *discordgo.User) bool {
	return user.ID == viper.GetString("owner")
}

func IsOwnerById(ID string) bool {
	return ID == viper.GetString("owner")
}

func CanRunCommand(flags []string, member *discordgo.Member, ID string) bool {
	if IsOwnerById(ID) {
		return true
	}

	if len(flags) == 0 {
		return true
	}

	for _, flag := range flags {
		roleID := viper.GetString("roles." + flag)

		for _, role := range member.Roles {
			if roleID == role {
				return true
			}
		}
	}

	return false
}
