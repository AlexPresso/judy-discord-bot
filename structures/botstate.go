package structures

type BotState struct {
	TempVoiceChannels map[string]interface{}
}

func NewBotState() *BotState {
	return &BotState{
		TempVoiceChannels: make(map[string]interface{}),
	}
}
