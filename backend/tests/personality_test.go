package tests

import (
	"testing"

	"hagumi/game-loop/config"
)

// TestPersonality_Existence tests that all personalities exist
func TestPersonality_Existence(t *testing.T) {
	expectedPersonalities := []string{
		"playful", "calm", "energetic", "grumpy",
		"affectionate", "lazy", "curious", "brave",
	}

	for _, personality := range expectedPersonalities {
		t.Run(personality, func(t *testing.T) {
			multiplier, exists := config.PersonalityMultipliers[personality]
			AssertTrue(t, exists, "Personality should exist")
			AssertNotNil(t, multiplier, "Personality multiplier should not be nil")
		})
	}
}

// TestPersonality_MultiplierRanges tests that multipliers are within valid ranges
func TestPersonality_MultiplierRanges(t *testing.T) {
	for personality, multiplier := range config.PersonalityMultipliers {
		t.Run(personality, func(t *testing.T) {
			// All multipliers should be positive
			AssertTrue(t, multiplier.Hunger > 0, "Hunger multiplier should be positive")
			AssertTrue(t, multiplier.Mood > 0, "Mood multiplier should be positive")
			AssertTrue(t, multiplier.Energy > 0, "Energy multiplier should be positive")

			// Multipliers should be within reasonable range (0.5 to 2.0)
			AssertTrue(t, multiplier.Hunger >= 0.5 && multiplier.Hunger <= 2.0, 
				"Hunger multiplier should be between 0.5 and 2.0")
			AssertTrue(t, multiplier.Mood >= 0.5 && multiplier.Mood <= 2.0, 
				"Mood multiplier should be between 0.5 and 2.0")
			AssertTrue(t, multiplier.Energy >= 0.5 && multiplier.Energy <= 2.0, 
				"Energy multiplier should be between 0.5 and 2.0")
		})
	}
}

// TestPersonality_Playful tests playful personality
func TestPersonality_Playful(t *testing.T) {
	multiplier := config.PersonalityMultipliers["playful"]
	
	AssertEqual(t, multiplier.Hunger, 1.0, "Playful hunger multiplier should be 1.0")
	AssertEqual(t, multiplier.Mood, 1.3, "Playful mood multiplier should be 1.3")
	AssertEqual(t, multiplier.Energy, 1.5, "Playful energy multiplier should be 1.5")
	
	t.Log("Playful: Balanced hunger, high mood, very high energy")
}

// TestPersonality_Calm tests calm personality
func TestPersonality_Calm(t *testing.T) {
	multiplier := config.PersonalityMultipliers["calm"]
	
	AssertEqual(t, multiplier.Hunger, 0.8, "Calm hunger multiplier should be 0.8")
	AssertEqual(t, multiplier.Mood, 0.7, "Calm mood multiplier should be 0.7")
	AssertEqual(t, multiplier.Energy, 0.6, "Calm energy multiplier should be 0.6")
	
	t.Log("Calm: Low hunger, low mood, very low energy")
}

// TestPersonality_Energetic tests energetic personality
func TestPersonality_Energetic(t *testing.T) {
	multiplier := config.PersonalityMultipliers["energetic"]
	
	AssertEqual(t, multiplier.Hunger, 1.3, "Energetic hunger multiplier should be 1.3")
	AssertEqual(t, multiplier.Mood, 1.5, "Energetic mood multiplier should be 1.5")
	AssertEqual(t, multiplier.Energy, 1.0, "Energetic energy multiplier should be 1.0")
	
	t.Log("Energetic: High hunger, very high mood, balanced energy")
}

// TestPersonality_Grumpy tests grumpy personality
func TestPersonality_Grumpy(t *testing.T) {
	multiplier := config.PersonalityMultipliers["grumpy"]
	
	AssertEqual(t, multiplier.Hunger, 1.0, "Grumpy hunger multiplier should be 1.0")
	AssertEqual(t, multiplier.Mood, 1.0, "Grumpy mood multiplier should be 1.0")
	AssertEqual(t, multiplier.Energy, 1.3, "Grumpy energy multiplier should be 1.3")
	
	t.Log("Grumpy: Balanced hunger, balanced mood, high energy")
}

// TestPersonality_Affectionate tests affectionate personality
func TestPersonality_Affectionate(t *testing.T) {
	multiplier := config.PersonalityMultipliers["affectionate"]
	
	AssertEqual(t, multiplier.Hunger, 1.0, "Affectionate hunger multiplier should be 1.0")
	AssertEqual(t, multiplier.Mood, 0.9, "Affectionate mood multiplier should be 0.9")
	AssertEqual(t, multiplier.Energy, 0.8, "Affectionate energy multiplier should be 0.8")
	
	t.Log("Affectionate: Balanced hunger, low mood, low energy")
}

// TestPersonality_Lazy tests lazy personality
func TestPersonality_Lazy(t *testing.T) {
	multiplier := config.PersonalityMultipliers["lazy"]
	
	AssertEqual(t, multiplier.Hunger, 0.7, "Lazy hunger multiplier should be 0.7")
	AssertEqual(t, multiplier.Mood, 0.5, "Lazy mood multiplier should be 0.5")
	AssertEqual(t, multiplier.Energy, 1.1, "Lazy energy multiplier should be 1.1")
	
	t.Log("Lazy: Very low hunger, very low mood, slightly high energy")
}

// TestPersonality_Curious tests curious personality
func TestPersonality_Curious(t *testing.T) {
	multiplier := config.PersonalityMultipliers["curious"]
	
	AssertEqual(t, multiplier.Hunger, 0.9, "Curious hunger multiplier should be 0.9")
	AssertEqual(t, multiplier.Mood, 1.2, "Curious mood multiplier should be 1.2")
	AssertEqual(t, multiplier.Energy, 0.7, "Curious energy multiplier should be 0.7")
	
	t.Log("Curious: Low hunger, high mood, low energy")
}

// TestPersonality_Brave tests brave personality
func TestPersonality_Brave(t *testing.T) {
	multiplier := config.PersonalityMultipliers["brave"]
	
	AssertEqual(t, multiplier.Hunger, 1.1, "Brave hunger multiplier should be 1.1")
	AssertEqual(t, multiplier.Mood, 1.0, "Brave mood multiplier should be 1.0")
	AssertEqual(t, multiplier.Energy, 0.5, "Brave energy multiplier should be 0.5")
	
	t.Log("Brave: Slightly high hunger, balanced mood, very low energy")
}

// TestPersonality_DefaultPersonality tests default personality fallback
func TestPersonality_DefaultPersonality(t *testing.T) {
	AssertEqual(t, config.DefaultPersonality, "playful", "Default personality should be playful")
	
	// Verify default personality exists
	multiplier, exists := config.PersonalityMultipliers[config.DefaultPersonality]
	AssertTrue(t, exists, "Default personality should exist")
	AssertNotNil(t, multiplier, "Default personality multiplier should not be nil")
}

// TestPersonality_DecayImpact tests impact of personality on decay
func TestPersonality_DecayImpact(t *testing.T) {
	baseRate := 1.0
	elapsedMinutes := 1

	t.Run("HighestHungerDecay", func(t *testing.T) {
		// Find personality with highest hunger decay
		maxHungerDecay := 0.0
		maxPersonality := ""
		
		for personality, multiplier := range config.PersonalityMultipliers {
			decay := config.HungerDecayBase * baseRate * multiplier.Hunger * float64(elapsedMinutes)
			if decay > maxHungerDecay {
				maxHungerDecay = decay
				maxPersonality = personality
			}
		}
		
		AssertEqual(t, maxPersonality, "energetic", "Energetic should have highest hunger decay")
		t.Logf("Highest hunger decay: %s with %.2f", maxPersonality, maxHungerDecay)
	})

	t.Run("LowestHungerDecay", func(t *testing.T) {
		// Find personality with lowest hunger decay
		minHungerDecay := 100.0
		minPersonality := ""
		
		for personality, multiplier := range config.PersonalityMultipliers {
			decay := config.HungerDecayBase * baseRate * multiplier.Hunger * float64(elapsedMinutes)
			if decay < minHungerDecay {
				minHungerDecay = decay
				minPersonality = personality
			}
		}
		
		AssertEqual(t, minPersonality, "lazy", "Lazy should have lowest hunger decay")
		t.Logf("Lowest hunger decay: %s with %.2f", minPersonality, minHungerDecay)
	})

	t.Run("HighestMoodDecay", func(t *testing.T) {
		// Find personality with highest mood decay
		maxMoodDecay := 0.0
		maxPersonality := ""
		
		for personality, multiplier := range config.PersonalityMultipliers {
			decay := config.MoodDecayBase * baseRate * multiplier.Mood * float64(elapsedMinutes)
			if decay > maxMoodDecay {
				maxMoodDecay = decay
				maxPersonality = personality
			}
		}
		
		AssertEqual(t, maxPersonality, "energetic", "Energetic should have highest mood decay")
		t.Logf("Highest mood decay: %s with %.2f", maxPersonality, maxMoodDecay)
	})

	t.Run("LowestMoodDecay", func(t *testing.T) {
		// Find personality with lowest mood decay
		minMoodDecay := 100.0
		minPersonality := ""
		
		for personality, multiplier := range config.PersonalityMultipliers {
			decay := config.MoodDecayBase * baseRate * multiplier.Mood * float64(elapsedMinutes)
			if decay < minMoodDecay {
				minMoodDecay = decay
				minPersonality = personality
			}
		}
		
		AssertEqual(t, minPersonality, "lazy", "Lazy should have lowest mood decay")
		t.Logf("Lowest mood decay: %s with %.2f", minPersonality, minMoodDecay)
	})

	t.Run("HighestEnergyDecay", func(t *testing.T) {
		// Find personality with highest energy decay
		maxEnergyDecay := 0.0
		maxPersonality := ""
		
		for personality, multiplier := range config.PersonalityMultipliers {
			decay := config.EnergyDecayBase * baseRate * multiplier.Energy * float64(elapsedMinutes)
			if decay > maxEnergyDecay {
				maxEnergyDecay = decay
				maxPersonality = personality
			}
		}
		
		AssertEqual(t, maxPersonality, "playful", "Playful should have highest energy decay")
		t.Logf("Highest energy decay: %s with %.2f", maxPersonality, maxEnergyDecay)
	})

	t.Run("LowestEnergyDecay", func(t *testing.T) {
		// Find personality with lowest energy decay
		minEnergyDecay := 100.0
		minPersonality := ""
		
		for personality, multiplier := range config.PersonalityMultipliers {
			decay := config.EnergyDecayBase * baseRate * multiplier.Energy * float64(elapsedMinutes)
			if decay < minEnergyDecay {
				minEnergyDecay = decay
				minPersonality = personality
			}
		}
		
		AssertEqual(t, minPersonality, "brave", "Brave should have lowest energy decay")
		t.Logf("Lowest energy decay: %s with %.2f", minPersonality, minEnergyDecay)
	})
}

// TestPersonality_TotalDecay tests total decay for each personality
func TestPersonality_TotalDecay(t *testing.T) {
	baseRate := 1.0
	elapsedMinutes := 1

	for personality, multiplier := range config.PersonalityMultipliers {
		t.Run(personality, func(t *testing.T) {
			hungerDecay := config.HungerDecayBase * baseRate * multiplier.Hunger * float64(elapsedMinutes)
			moodDecay := config.MoodDecayBase * baseRate * multiplier.Mood * float64(elapsedMinutes)
			energyDecay := config.EnergyDecayBase * baseRate * multiplier.Energy * float64(elapsedMinutes)
			totalDecay := hungerDecay + moodDecay + energyDecay

			t.Logf("%s: H=%.2f, M=%.2f, E=%.2f, Total=%.2f", 
				personality, hungerDecay, moodDecay, energyDecay, totalDecay)

			// Total decay should be within reasonable range
			AssertTrue(t, totalDecay > 0, "Total decay should be positive")
			AssertTrue(t, totalDecay < 5.0, "Total decay should be less than 5.0")
		})
	}
}

// TestPersonality_UniqueCharacteristics tests that each personality has unique characteristics
func TestPersonality_UniqueCharacteristics(t *testing.T) {
	// Verify that no two personalities have identical multipliers
	personalities := make([]string, 0, len(config.PersonalityMultipliers))
	for personality := range config.PersonalityMultipliers {
		personalities = append(personalities, personality)
	}

	for i := 0; i < len(personalities); i++ {
		for j := i + 1; j < len(personalities); j++ {
			p1 := config.PersonalityMultipliers[personalities[i]]
			p2 := config.PersonalityMultipliers[personalities[j]]

			isIdentical := p1.Hunger == p2.Hunger && 
				p1.Mood == p2.Mood && 
				p1.Energy == p2.Energy

			AssertFalse(t, isIdentical, 
				"Personalities should have unique multipliers: %s and %s", 
				personalities[i], personalities[j])
		}
	}
}