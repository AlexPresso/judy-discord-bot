package structures

type BotState struct {
	VoiceChannelCount map[string]map[int]interface{}
	TempVoiceChannels map[string]*TempChannel
}

func NewBotState() *BotState {
	return &BotState{
		VoiceChannelCount: make(map[string]map[int]interface{}),
		TempVoiceChannels: make(map[string]*TempChannel),
	}
}
