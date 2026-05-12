package ai

import (
	"testing"
)

func TestDetermineState(t *testing.T) {
	tests := []struct {
		name     string
		stats    PetStats
		stage    string
		expected AIState
	}{
		{"Starving", PetStats{Hunger: 5, Mood: 50, Energy: 50, Health: 100}, "adult", StateCritical},
		{"Sleeping", PetStats{Hunger: 50, Mood: 50, Energy: 5, Health: 100}, "adult", StateGoingSleep},
		{"Sick", PetStats{Hunger: 15, Mood: 50, Energy: 50, Health: 40}, "adult", StateSick},
		{"Bored", PetStats{Hunger: 50, Mood: 40, Energy: 50, Health: 100}, "adult", StateBored},
		{"Happy", PetStats{Hunger: 90, Mood: 90, Energy: 90, Health: 90}, "adult", StateExcited},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := DetermineState(tt.stats, tt.stage)
			if got != tt.expected {
				t.Errorf("DetermineState() = %v, want %v", got, tt.expected)
			}
		})
	}
}
