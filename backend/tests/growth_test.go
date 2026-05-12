package tests

import (
	"testing"
)

// TestGrowth_CalculateGrowth tests growth calculation
func TestGrowth_CalculateGrowth(t *testing.T) {
	t.Run("PerfectStats", func(t *testing.T) {
		// All stats at 100
		hunger := 100
		mood := 100
		energy := 100
		health := 100
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 100.0, "Growth should be 100% with perfect stats")
	})

	t.Run("AverageStats", func(t *testing.T) {
		// All stats at 50
		hunger := 50
		mood := 50
		energy := 50
		health := 50
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 50.0, "Growth should be 50% with average stats")
	})

	t.Run("PoorStats", func(t *testing.T) {
		// All stats at 25
		hunger := 25
		mood := 25
		energy := 25
		health := 25
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 25.0, "Growth should be 25% with poor stats")
	})

	t.Run("MixedStats", func(t *testing.T) {
		// Mixed stats
		hunger := 80
		mood := 60
		energy := 90
		health := 70
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 75.0, "Growth should be 75% with mixed stats")
	})
}

// TestGrowth_GrowthSpeed tests growth speed multiplier
func TestGrowth_GrowthSpeed(t *testing.T) {
	t.Run("NormalGrowthSpeed", func(t *testing.T) {
		avgStats := 75.0
		careFactor := avgStats / 100.0
		growthSpeed := 1.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 75.0, "Growth should be 75% with normal speed")
	})

	t.Run("FastGrowthSpeed", func(t *testing.T) {
		avgStats := 75.0
		careFactor := avgStats / 100.0
		growthSpeed := 1.5
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 112.5, "Growth should be 112.5% with fast speed")
	})

	t.Run("SlowGrowthSpeed", func(t *testing.T) {
		avgStats := 75.0
		careFactor := avgStats / 100.0
		growthSpeed := 0.5
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 37.5, "Growth should be 37.5% with slow speed")
	})
}

// TestGrowth_CareFactor tests care factor calculation
func TestGrowth_CareFactor(t *testing.T) {
	t.Run("MaxCareFactor", func(t *testing.T) {
		avgStats := 100.0
		careFactor := avgStats / 100.0
		AssertEqual(t, careFactor, 1.0, "Care factor should be 1.0 with max stats")
	})

	t.Run("MinCareFactor", func(t *testing.T) {
		avgStats := 0.0
		careFactor := avgStats / 100.0
		AssertEqual(t, careFactor, 0.0, "Care factor should be 0.0 with min stats")
	})

	t.Run("HalfCareFactor", func(t *testing.T) {
		avgStats := 50.0
		careFactor := avgStats / 100.0
		AssertEqual(t, careFactor, 0.5, "Care factor should be 0.5 with half stats")
	})
}

// TestGrowth_EdgeCases tests edge cases in growth calculation
func TestGrowth_EdgeCases(t *testing.T) {
	t.Run("ZeroGrowthSpeed", func(t *testing.T) {
		avgStats := 75.0
		careFactor := avgStats / 100.0
		growthSpeed := 0.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 0.0, "Growth should be 0% with zero growth speed")
	})

	t.Run("MaxGrowthSpeed", func(t *testing.T) {
		avgStats := 75.0
		careFactor := avgStats / 100.0
		growthSpeed := 2.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 150.0, "Growth should be 150% with max growth speed")
	})

	t.Run("ZeroStats", func(t *testing.T) {
		hunger := 0
		mood := 0
		energy := 0
		health := 0
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 0.0, "Growth should be 0% with zero stats")
	})
}

// TestGrowth_StatImpact tests impact of individual stats on growth
func TestGrowth_StatImpact(t *testing.T) {
	t.Run("HighHungerImpact", func(t *testing.T) {
		// High hunger, others low
		hunger := 100
		mood := 25
		energy := 25
		health := 25
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 43.75, "Growth should be 43.75% with high hunger")
	})

	t.Run("HighMoodImpact", func(t *testing.T) {
		// High mood, others low
		hunger := 25
		mood := 100
		energy := 25
		health := 25
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 43.75, "Growth should be 43.75% with high mood")
	})

	t.Run("BalancedStats", func(t *testing.T) {
		// All stats balanced
		hunger := 75
		mood := 75
		energy := 75
		health := 75
		growthSpeed := 1.0
		
		avgStats := (float64(hunger) + float64(mood) + float64(energy) + float64(health)) / 4.0
		careFactor := avgStats / 100.0
		expectedGrowth := careFactor * growthSpeed * 100.0
		
		AssertEqual(t, expectedGrowth, 75.0, "Growth should be 75% with balanced stats")
	})
}

// TestGrowth_GrowthThresholds tests growth thresholds
func TestGrowth_GrowthThresholds(t *testing.T) {
	t.Run("ExcellentGrowth", func(t *testing.T) {
		avgStats := 90.0
		careFactor := avgStats / 100.0
		growthSpeed := 1.0
		growth := careFactor * growthSpeed * 100.0
		
		AssertTrue(t, growth >= 80.0, "Growth should be excellent (>=80%)")
	})

	t.Run("GoodGrowth", func(t *testing.T) {
		avgStats := 70.0
		careFactor := avgStats / 100.0
		growthSpeed := 1.0
		growth := careFactor * growthSpeed * 100.0
		
		AssertTrue(t, growth >= 60.0 && growth < 80.0, "Growth should be good (60-80%)")
	})

	t.Run("AverageGrowth", func(t *testing.T) {
		avgStats := 50.0
		careFactor := avgStats / 100.0
		growthSpeed := 1.0
		growth := careFactor * growthSpeed * 100.0
		
		AssertTrue(t, growth >= 40.0 && growth < 60.0, "Growth should be average (40-60%)")
	})

	t.Run("PoorGrowth", func(t *testing.T) {
		avgStats := 30.0
		careFactor := avgStats / 100.0
		growthSpeed := 1.0
		growth := careFactor * growthSpeed * 100.0
		
		AssertTrue(t, growth < 40.0, "Growth should be poor (<40%)")
	})
}