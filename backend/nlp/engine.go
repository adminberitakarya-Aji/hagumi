package nlp

import (
	"strings"
)

// Intent represents the detected goal of a player's message
type Intent string

const (
	IntentGreeting Intent = "greeting"
	IntentHungry   Intent = "hungry"
	IntentPlay     Intent = "play"
	IntentUnknown  Intent = "unknown"
)

// NLPEngine handles basic natural language processing for pet interactions
type NLPEngine struct{}

func NewNLPEngine() *NLPEngine {
	return &NLPEngine{}
}

// AnalyzeIntent simple keyword-based intent detection
func (e *NLPEngine) AnalyzeIntent(message string) Intent {
	msg := " " + strings.ToLower(message) + " "
	
	if strings.Contains(msg, " hello ") || strings.Contains(msg, " hi ") {
		return IntentGreeting
	}
	if strings.Contains(msg, " food ") || strings.Contains(msg, " hungry ") || strings.Contains(msg, " eat ") {
		return IntentHungry
	}
	if strings.Contains(msg, " play ") || strings.Contains(msg, " game ") || strings.Contains(msg, " fun ") {
		return IntentPlay
	}
	
	return IntentUnknown
}

// GetSentiment simple sentiment analysis (1.0 positive, -1.0 negative)
func (e *NLPEngine) GetSentiment(message string) float64 {
	positiveWords := []string{"love", "happy", "good", "great", "awesome"}
	negativeWords := []string{"hate", "sad", "bad", "angry", "terrible"}
	
	msg := strings.ToLower(message)
	score := 0.0
	
	for _, w := range positiveWords {
		if strings.Contains(msg, w) {
			score += 0.2
		}
	}
	for _, w := range negativeWords {
		if strings.Contains(msg, w) {
			score -= 0.2
		}
	}
	
	if score > 1.0 { score = 1.0 }
	if score < -1.0 { score = -1.0 }
	
	return score
}
