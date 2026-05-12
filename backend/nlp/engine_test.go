package nlp

import (
	"testing"
)

func TestNLPEngine_AnalyzeIntent(t *testing.T) {
	e := NewNLPEngine()
	
	tests := []struct {
		message  string
		expected Intent
	}{
		{"Hello Hagumi!", IntentGreeting},
		{"Hi there", IntentGreeting},
		{"I am hungry", IntentHungry},
		{"Give me some food", IntentHungry},
		{"Let's play a game", IntentPlay},
		{"Having fun", IntentPlay},
		{"What is the weather?", IntentUnknown},
	}
	
	for _, tt := range tests {
		result := e.AnalyzeIntent(tt.message)
		if result != tt.expected {
			t.Errorf("AnalyzeIntent(%s) = %s; want %s", tt.message, result, tt.expected)
		}
	}
}

func TestNLPEngine_GetSentiment(t *testing.T) {
	e := NewNLPEngine()
	
	tests := []struct {
		message string
		min     float64
		max     float64
	}{
		{"I love you!", 0.1, 1.0},
		{"I am so happy", 0.1, 1.0},
		{"I hate this", -1.0, -0.1},
		{"You are bad", -1.0, -0.1},
		{"The sky is blue", -0.1, 0.1},
	}
	
	for _, tt := range tests {
		result := e.GetSentiment(tt.message)
		if result < tt.min || result > tt.max {
			t.Errorf("GetSentiment(%s) = %f; want range [%f, %f]", tt.message, result, tt.min, tt.max)
		}
	}
}
