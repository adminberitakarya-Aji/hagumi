package genetics

import (
	"fmt"
	"math/rand"
	"sort"
	"strings"
	"time"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

// Allele defines a genetic trait with dominant and recessive variants
type Allele struct {
	Dominant       string
	DominantLabel  string
	Recessive      string
	RecessiveLabel string
}

// ComplexGenetics represents the full genetic information of a pet
type ComplexGenetics struct {
	Color          string                        `json:"color"`
	ColorName      string                        `json:"colorName"`
	Personality    string                        `json:"personality"`
	BaseHungerRate float64                       `json:"baseHungerRate"`
	BaseMoodRate   float64                       `json:"baseMoodRate"`
	BaseEnergyRate float64                       `json:"baseEnergyRate"`
	GrowthSpeed    float64                       `json:"growthSpeed"`
	IsMutant       bool                          `json:"isMutant"`
	Generation     int                           `json:"generation"`
	Alleles        map[string]map[string]string `json:"alleles"` // trait -> {pair, expressed}
}

// TraitAlleles maps trait names to their dominant/recessive definitions
var TraitAlleles = map[string]Allele{
	"colorPrimary": {
		Dominant: "R", DominantLabel: "Red",
		Recessive: "r", RecessiveLabel: "Blue",
	},
	"colorSecondary": {
		Dominant: "G", DominantLabel: "Gold",
		Recessive: "g", RecessiveLabel: "Green",
	},
	"pattern": {
		Dominant: "S", DominantLabel: "Solid",
		Recessive: "s", RecessiveLabel: "Spotted",
	},
}

// CreateAllelePair simulates Mendelian inheritance for a single trait
func CreateAllelePair(dominant, recessive string) string {
	allele1 := recessive
	if rand.Float64() > 0.5 {
		allele1 = dominant
	}
	allele2 := recessive
	if rand.Float64() > 0.5 {
		allele2 = dominant
	}

	pair := []string{allele1, allele2}
	sort.Slice(pair, func(i, j int) bool {
		// Dominant (uppercase) comes first
		if pair[i] == strings.ToUpper(pair[i]) && pair[j] == strings.ToLower(pair[j]) {
			return true
		}
		if pair[i] == strings.ToLower(pair[i]) && pair[j] == strings.ToUpper(pair[j]) {
			return false
		}
		return pair[i] < pair[j]
	})

	return strings.Join(pair, "")
}

// ExpressAllele determines the phenotype from a genotype pair
func ExpressAllele(pair string) string {
	if len(pair) < 2 {
		return ""
	}
	if pair[0:1] == strings.ToUpper(pair[0:1]) {
		return pair[0:1]
	}
	return pair[1:2]
}

const MutationRate = 0.01

// Combine performs dihybrid cross between two parents to produce a child
func Combine(p1, p2 ComplexGenetics, generation int) ComplexGenetics {
	mutationRate := MutationRate * (1 + float64(generation)*0.1)
	isMutant := rand.Float64() < mutationRate

	// Allele inheritance
	alleles := make(map[string]map[string]string)
	
	traits := []string{"colorPrimary", "colorSecondary", "pattern"}
	for _, trait := range traits {
		def := TraitAlleles[trait]
		pair := CreateAllelePair(def.Dominant, def.Recessive)
		expressed := ExpressAllele(pair)
		alleles[trait] = map[string]string{
			"pair":      pair,
			"expressed": expressed,
		}
	}

	// Color expression
	colorMap := map[string]string{
		"R": p1.Color,
		"r": p2.Color,
		"G": "#FFD700",
		"g": "#4CAF50",
		"S": "solid",
		"s": "spotted",
	}

	mutationColors := []struct{ Color, Name string }{
		{"#E040FB", "Purple Dream"},
		{"#00E5FF", "Cyan Star"},
		{"#FF6D00", "Solar Flare"},
		{"#00E676", "Neon Sprout"},
		{"#D500F9", "Cosmic Violet"},
	}

	primaryColor := p1.Color
	if isMutant {
		primaryColor = mutationColors[rand.Intn(len(mutationColors))].Color
	} else {
		expressedPrimary := alleles["colorPrimary"]["expressed"]
		if val, ok := colorMap[expressedPrimary]; ok {
			primaryColor = val
		}
	}

	colorName := fmt.Sprintf("%s-%s Mix", p1.ColorName, p2.ColorName)
	if isMutant {
		colorName = mutationColors[rand.Intn(len(mutationColors))].Name
	}

	// Personality
	personality := p1.Personality
	if rand.Float64() > 0.5 {
		personality = p2.Personality
	}

	// Numeric traits averaging
	avgWithMutation := func(v1, v2 float64) float64 {
		base := (v1 + v2) / 2
		variation := base * (rand.Float64()*0.2 - 0.1)
		res := base + variation
		if rand.Float64() < mutationRate {
			if rand.Float64() > 0.5 {
				res *= 1.3
			} else {
				res *= 0.7
			}
		}
		return float64(int(res*100)) / 100
	}

	return ComplexGenetics{
		Color:          primaryColor,
		ColorName:      colorName,
		Personality:    personality,
		BaseHungerRate: avgWithMutation(p1.BaseHungerRate, p2.BaseHungerRate),
		BaseMoodRate:   avgWithMutation(p1.BaseMoodRate, p2.BaseMoodRate),
		BaseEnergyRate: avgWithMutation(p1.BaseEnergyRate, p2.BaseEnergyRate),
		GrowthSpeed:    avgWithMutation(p1.GrowthSpeed, p2.GrowthSpeed),
		IsMutant:       isMutant,
		Generation:     generation + 1,
		Alleles:        alleles,
	}
}
