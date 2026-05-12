package ai

import (
	"math/rand"
	"time"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

// AIState represents the current mental state of a pet
type AIState string

const (
	StateIdle         AIState = "idle"
	StateHungry       AIState = "hungry"
	StateTired        AIState = "tired"
	StateBored        AIState = "bored"
	StateSick         AIState = "sick"
	StateDepressed    AIState = "depressed"
	StateExcited      AIState = "excited"
	StateGrowing      AIState = "growing"
	StateCritical     AIState = "critical"
	StateDead         AIState = "dead"
	StateSeekingFood  AIState = "seeking_food"
	StateGoingSleep   AIState = "going_sleep"
	StatePlayingAlone AIState = "playing_alone"
)

// PetStats mirror the core stats needed for AI decisions
type PetStats struct {
	Hunger int
	Mood   int
	Energy int
	Health int
}

// AIStateInfo contains visual and descriptive info about a state
type AIStateInfo struct {
	State     AIState `json:"state"`
	Emoji     string  `json:"emoji"`
	Message   string  `json:"message"`
	Animation string  `json:"animation"`
}

// StateMap provides the mapping from State to info
var StateMap = map[AIState]struct {
	Emoji     string
	Messages  []string
	Animation string
}{
	StateIdle:         {"😊", []string{"...", "Nyaa~?", "Feeling comfy!"}, "idle-bounce"},
	StateHungry:       {"🍖", []string{"I'm hungry!", "Food please?", "Tummy is growling..."}, "paw-at-screen"},
	StateSeekingFood:  {"🔍", []string{"Looking for snacks...", "Where is the food?"}, "look-around"},
	StateTired:        {"😴", []string{"Getting sleepy...", "Yawn..."}, "rub-eyes"},
	StateGoingSleep:   {"💤", []string{"Going to bed...", "Goodnight..."}, "yawn-stretch"},
	StateBored:        {"😐", []string{"I'm bored...", "Can we do something?"}, "sigh"},
	StatePlayingAlone: {"🎾", []string{"Playing by myself!", "Zoomies!"}, "hop-around"},
	StateSick:         {"🤒", []string{"I don't feel well...", "Hic..."}, "tremble"},
	StateDepressed:    {"😢", []string{"Feeling lonely...", "Sigh..."}, "curl-up"},
	StateExcited:      {"🎉", []string{"Yay! Let's play!", "Best day ever!"}, "jump-spin"},
	StateGrowing:      {"✨", []string{"Something is happening...", "I'm changing!"}, "glow-pulse"},
	StateCritical:     {"💔", []string{"I need help...", "Everything hurts..."}, "fade-shake"},
	StateDead:         {"🕊️", []string{"..."}, "still"},
}

// DetermineState runs the state machine based on pet stats
func DetermineState(stats PetStats, stage string) AIState {
	if stage == "dead" {
		return StateDead
	}
	if stage == "egg" {
		return StateIdle
	}

	// Critical
	if stats.Hunger <= 10 || stats.Health <= 20 {
		return StateCritical
	}

	// Sickness
	if stats.Hunger < 20 && stats.Health < 50 {
		return StateSick
	}

	// Emotions
	if stats.Mood < 20 {
		return StateDepressed
	}

	// Physical needs
	if stats.Hunger < 30 {
		return StateSeekingFood
	}
	if stats.Hunger < 50 {
		return StateHungry
	}
	if stats.Energy < 20 {
		return StateGoingSleep
	}
	if stats.Energy < 40 {
		return StateTired
	}

	// Social
	if stats.Mood < 50 {
		return StateBored
	}

	// High happiness
	if stats.Hunger > 80 && stats.Mood > 80 && stats.Energy > 80 {
		return StateExcited
	}

	return StateIdle
}

// GetStateInfo generates full state info including a random message
func GetStateInfo(state AIState) AIStateInfo {
	info, ok := StateMap[state]
	if !ok {
		info = StateMap[StateIdle]
	}

	msg := "..."
	if len(info.Messages) > 0 {
		msg = info.Messages[rand.Intn(len(info.Messages))]
	}

	return AIStateInfo{
		State:     state,
		Emoji:     info.Emoji,
		Message:   msg,
		Animation: info.Animation,
	}
}
