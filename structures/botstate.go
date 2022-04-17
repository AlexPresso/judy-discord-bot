package structures

type BotState struct {
	VoiceChannelCount map[string]uint8
	TempVoiceChannels map[string]string
}

func NewBotState() *BotState {
	return &BotState{
		VoiceChannelCount: make(map[string]uint8),
		TempVoiceChannels: make(map[string]string),
	}
}
