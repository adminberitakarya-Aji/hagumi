package genetics

import (
	"testing"
)

func TestCombine(t *testing.T) {
	parent1 := ComplexGenetics{
		BaseHungerRate: 1.0,
		Personality:    "playful",
		Color:          "#FF0000",
		ColorName:      "Red",
		Alleles:        map[string]map[string]string{"colorPrimary": {"pair": "RR", "expressed": "R"}},
	}
	parent2 := ComplexGenetics{
		BaseHungerRate: 0.8,
		Personality:    "calm",
		Color:          "#0000FF",
		ColorName:      "Blue",
		Alleles:        map[string]map[string]string{"colorPrimary": {"pair": "rr", "expressed": "r"}},
	}

	child := Combine(parent1, parent2, 0)

	if child.BaseHungerRate < 0.6 || child.BaseHungerRate > 1.2 {
		t.Errorf("Expected child hunger rate roughly between parents, got %f", child.BaseHungerRate)
	}

	if child.Generation != 1 {
		t.Errorf("Expected child generation 1, got %d", child.Generation)
	}

	if len(child.Alleles) == 0 {
		t.Error("Expected child to have alleles")
	}
}

