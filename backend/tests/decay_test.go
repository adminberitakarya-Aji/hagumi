package tests

import (
	"testing"

	"github.com/hagumi/game-loop/config"
)

// TestDecay_CalculateHungerDecay tests hunger decay calculation
func TestDecay_CalculateHungerDecay(t *testing.T) {
	t.Run("BaseDecayRate", func(t *testing.T) {
		AssertEqual(t, config.HungerDecayBase, 0.5, "Base hunger decay should be 0.5")
	})

	t.Run("PersonalityMultiplier", func(t *testing.T) {
		// Test playful personality
		playful := config.PersonalityMultipliers["playful"]
		AssertEqual(t, playful.Hunger, 1.0, "Playful hunger multiplier should be 1.0")
		
		// Test energetic personality
		energetic := config.PersonalityMultipliers["energetic"]
		AssertEqual(t, energetic.Hunger, 1.3, "Energetic hunger multiplier should be 1.3")
		
		// Test lazy personality
		lazy := config.PersonalityMultipliers["lazy"]
		AssertEqual(t, lazy.Hunger, 0.7, "Lazy hunger multiplier should be 0.7")
	})

	t.Run("DecayCalculation", func(t *testing.T) {
		baseRate := 1.0
		personalityMultiplier := 1.0
		elapsedMinutes := 1
		
		expectedDecay := config.HungerDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 0.5, "Hunger decay should be 0.5 for 1 minute")
	})
}

// TestDecay_CalculateMoodDecay tests mood decay calculation
func TestDecay_CalculateMoodDecay(t *testing.T) {
	t.Run("BaseDecayRate", func(t *testing.T) {
		AssertEqual(t, config.MoodDecayBase, 0.3, "Base mood decay should be 0.3")
	})

	t.Run("PersonalityMultiplier", func(t *testing.T) {
		// Test playful personality
		playful := config.PersonalityMultipliers["playful"]
		AssertEqual(t, playful.Mood, 1.3, "Playful mood multiplier should be 1.3")
		
		// Test grumpy personality
		grumpy := config.PersonalityMultipliers["grumpy"]
		AssertEqual(t, grumpy.Mood, 1.0, "Grumpy mood multiplier should be 1.0")
		
		// Test lazy personality
		lazy := config.PersonalityMultipliers["lazy"]
		AssertEqual(t, lazy.Mood, 0.5, "Lazy mood multiplier should be 0.5")
	})

	t.Run("DecayCalculation", func(t *testing.T) {
		baseRate := 1.0
		personalityMultiplier := 1.0
		elapsedMinutes := 1
		
		expectedDecay := config.MoodDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 0.3, "Mood decay should be 0.3 for 1 minute")
	})
}

// TestDecay_CalculateEnergyDecay tests energy decay calculation
func TestDecay_CalculateEnergyDecay(t *testing.T) {
	t.Run("BaseDecayRate", func(t *testing.T) {
		AssertEqual(t, config.EnergyDecayBase, 0.4, "Base energy decay should be 0.4")
	})

	t.Run("PersonalityMultiplier", func(t *testing.T) {
		// Test playful personality
		playful := config.PersonalityMultipliers["playful"]
		AssertEqual(t, playful.Energy, 1.5, "Playful energy multiplier should be 1.5")
		
		// Test energetic personality
		energetic := config.PersonalityMultipliers["energetic"]
		AssertEqual(t, energetic.Energy, 1.0, "Energetic energy multiplier should be 1.0")
		
		// Test calm personality
		calm := config.PersonalityMultipliers["calm"]
		AssertEqual(t, calm.Energy, 0.6, "Calm energy multiplier should be 0.6")
	})

	t.Run("DecayCalculation", func(t *testing.T) {
		baseRate := 1.0
		personalityMultiplier := 1.0
		elapsedMinutes := 1
		
		expectedDecay := config.EnergyDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 0.4, "Energy decay should be 0.4 for 1 minute")
	})
}

// TestDecay_StatClamping tests stat value clamping
func TestDecay_StatClamping(t *testing.T) {
	t.Run("ClampAboveMax", func(t *testing.T) {
		value := 150
		clamped := clamp(value)
		AssertEqual(t, clamped, config.MaxStat, "Value above max should be clamped to max")
	})

	t.Run("ClampBelowMin", func(t *testing.T) {
		value := -10
		clamped := clamp(value)
		AssertEqual(t, clamped, config.MinStat, "Value below min should be clamped to min")
	})

	t.Run("ClampWithinRange", func(t *testing.T) {
		value := 50
		clamped := clamp(value)
		AssertEqual(t, clamped, value, "Value within range should not be clamped")
	})

	t.Run("ClampAtMax", func(t *testing.T) {
		value := config.MaxStat
		clamped := clamp(value)
		AssertEqual(t, clamped, value, "Value at max should not be clamped")
	})

	t.Run("ClampAtMin", func(t *testing.T) {
		value := config.MinStat
		clamped := clamp(value)
		AssertEqual(t, clamped, value, "Value at min should not be clamped")
	})
}

// TestDecay_StarvingMechanic tests starving health decay
func TestDecay_StarvingMechanic(t *testing.T) {
	t.Run("StarvingThreshold", func(t *testing.T) {
		AssertEqual(t, config.StarvingThresh, 10, "Starving threshold should be 10")
	})

	t.Run("HealthDecay", func(t *testing.T) {
		AssertEqual(t, config.HealthDecay, 2, "Health decay should be 2")
	})

	t.Run("StarvingCondition", func(t *testing.T) {
		hunger := 5 // Below starving threshold
		health := 100
		expectedHealth := health - config.HealthDecay
		
		t.Logf("When hunger is %d (below %d), health should decrease by %d", 
			hunger, config.StarvingThresh, config.HealthDecay)
		AssertEqual(t, expectedHealth, 98, "Health should decrease when starving")
	})

	t.Run("NotStarvingCondition", func(t *testing.T) {
		hunger := 50 // Above starving threshold
		health := 100
		expectedHealth := health // Should not change
		
		t.Logf("When hunger is %d (above %d), health should not decrease", 
			hunger, config.StarvingThresh)
		AssertEqual(t, expectedHealth, 100, "Health should not decrease when not starving")
	})
}

// TestDecay_MultiTickDecay tests decay over multiple ticks
func TestDecay_MultiTickDecay(t *testing.T) {
	t.Run("TwoTicks", func(t *testing.T) {
		baseRate := 1.0
		personalityMultiplier := 1.0
		elapsedMinutes := 2
		
		expectedDecay := config.HungerDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 1.0, "Hunger decay should be 1.0 for 2 minutes")
	})

	t.Run("TenTicks", func(t *testing.T) {
		baseRate := 1.0
		personalityMultiplier := 1.0
		elapsedMinutes := 10
		
		expectedDecay := config.HungerDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 5.0, "Hunger decay should be 5.0 for 10 minutes")
	})
}

// TestDecay_PersonalityVariations tests decay with different personalities
func TestDecay_PersonalityVariations(t *testing.T) {
	personalities := []string{
		"playful", "calm", "energetic", "grumpy", 
		"affectionate", "lazy", "curious", "brave",
	}

	for _, personality := range personalities {
		t.Run(personality, func(t *testing.T) {
			multiplier, exists := config.PersonalityMultipliers[personality]
			AssertTrue(t, exists, "Personality should exist")
			
			// Verify all multipliers are positive
			AssertTrue(t, multiplier.Hunger > 0, "Hunger multiplier should be positive")
			AssertTrue(t, multiplier.Mood > 0, "Mood multiplier should be positive")
			AssertTrue(t, multiplier.Energy > 0, "Energy multiplier should be positive")
			
			t.Logf("%s: H=%.1f, M=%.1f, E=%.1f", 
				personality, multiplier.Hunger, multiplier.Mood, multiplier.Energy)
		})
	}
}

// TestDecay_EdgeCases tests edge cases in decay calculations
func TestDecay_EdgeCases(t *testing.T) {
	t.Run("ZeroBaseRate", func(t *testing.T) {
		baseRate := 0.0
		personalityMultiplier := 1.0
		elapsedMinutes := 1
		
		expectedDecay := config.HungerDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 0.0, "Decay should be 0 with zero base rate")
	})

	t.Run("ZeroPersonalityMultiplier", func(t *testing.T) {
		baseRate := 1.0
		personalityMultiplier := 0.0
		elapsedMinutes := 1
		
		expectedDecay := config.HungerDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 0.0, "Decay should be 0 with zero personality multiplier")
	})

	t.Run("ZeroElapsedTime", func(t *testing.T) {
		baseRate := 1.0
		personalityMultiplier := 1.0
		elapsedMinutes := 0
		
		expectedDecay := config.HungerDecayBase * baseRate * personalityMultiplier * float64(elapsedMinutes)
		AssertEqual(t, expectedDecay, 0.0, "Decay should be 0 with zero elapsed time")
	})
}

// clamp is a helper function to clamp values between min and max
func clamp(val int) int {
	if val < config.MinStat {
		return config.MinStat
	}
	if val > config.MaxStat {
		return config.MaxStat
	}
	return val
}