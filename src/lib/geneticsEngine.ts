
// ─── Allele System ──────────────────────────────────
// Mendelian inheritance: dominant (capital) vs recessive (lowercase)
// Example: R = Red (dominant), r = blue (recessive)
// RR = Red, Rr = Red (carrier of blue), rr = Blue

export interface Allele {
  dominant: string
  dominantLabel: string
  recessive: string
  recessiveLabel: string
}

export interface ComplexGenetics {
  // Visible phenotype
  color: {
    primary: string
    secondary: string
    pattern: string
  }
  
  // Genotype (hidden)
  alleles: Record<string, { pair: string; expressed: string }>
  
  // Physical traits
  size: 'small' | 'medium' | 'large'
  earType: 'round' | 'pointy' | 'floppy'
  tailStyle: 'short' | 'long' | 'fluffy'
  
  // Mutation tracking
  mutationRate: number
  generation: number
  isMutant: boolean
}

// ─── Trait Definitions ───────────────────────────────

export const TRAIT_ALLELES: Record<string, Allele> = {
  // Color traits
  colorPrimary: {
    dominant: 'R', dominantLabel: 'Red',
    recessive: 'r', recessiveLabel: 'Blue',
  },
  colorSecondary: {
    dominant: 'G', dominantLabel: 'Gold',
    recessive: 'g', recessiveLabel: 'Green',
  },
  pattern: {
    dominant: 'S', dominantLabel: 'Solid',
    recessive: 's', recessiveLabel: 'Spotted',
  },
  
  // Physical traits
  size: {
    dominant: 'L', dominantLabel: 'Large',
    recessive: 'l', recessiveLabel: 'Small',
  },
  ear: {
    dominant: 'R', dominantLabel: 'Round',
    recessive: 'p', recessiveLabel: 'Pointy',
  },
  tail: {
    dominant: 'F', dominantLabel: 'Fluffy',
    recessive: 's', recessiveLabel: 'Short',
  },
}

// ─── Dihybrid Cross (Punnett Square) ─────────────────

export function createAllelePair(dominant: string, recessive: string): string {
  // Randomly pick which allele each parent contributes
  const allele1 = Math.random() > 0.5 ? dominant : recessive
  const allele2 = Math.random() > 0.5 ? dominant : recessive
  
  // Sort so dominant comes first
  const pair = [allele1, allele2].sort((a, b) => {
    if (a === a.toUpperCase() && b === b.toLowerCase()) return -1
    if (a === a.toLowerCase() && b === b.toUpperCase()) return 1
    return a.localeCompare(b)
  })
  
  return pair.join('')
}

export function expressAllele(pair: string): string {
  // If any allele is dominant (uppercase), express that
  if (pair[0] === pair[0].toUpperCase()) return pair[0]
  // Both recessive
  return pair[1]
}

export function getPunnettSquare(parentA: string, parentB: string): string[] {
  // Returns all 4 possible combinations
  return [
    parentA[0] + parentB[0],
    parentA[0] + parentB[1],
    parentA[1] + parentB[0],
    parentA[1] + parentB[1],
  ].map(p => p.split('').sort((a, b) => {
    if (a === a.toUpperCase() && b === b.toLowerCase()) return -1
    if (a === a.toLowerCase() && b === b.toUpperCase()) return 1
    return a.localeCompare(b)
  }).join(''))
}

// ─── Mutation System ─────────────────────────────────

const MUTATION_RATE = 0.01 // 1% chance

function rollForMutation(generation: number): boolean {
  // Each generation slightly increases mutation chance
  const rate = MUTATION_RATE * (1 + generation * 0.1)
  return Math.random() < rate
}

// ─── Personality Inheritance ─────────────────────────

const PERSONALITY_TRAITS = [
  'playful', 'calm', 'energetic', 'grumpy',
  'affectionate', 'lazy', 'curious', 'brave',
] as const

function combinePersonality(p1: string, p2: string): string {
  // 40% chance to inherit directly from one parent
  if (Math.random() < 0.4) return Math.random() > 0.5 ? p1 : p2
  // 40% chance to blend (pick random trait)
  if (Math.random() < 0.67) {
    return PERSONALITY_TRAITS[Math.floor(Math.random() * PERSONALITY_TRAITS.length)]
  }
  // 20% chance for unique combination
  return `${p1}-${p2}`
}

// ─── Number Traits Averaging ─────────────────────────

function averageWithMutation(val1: number, val2: number, mutationRate: number): number {
  const base = (val1 + val2) / 2
  // Add small random variation (±10%)
  const variation = base * (Math.random() * 0.2 - 0.1)
  let result = base + variation
  
  // Mutation can cause bigger swings
  if (Math.random() < mutationRate) {
    result *= Math.random() > 0.5 ? 1.3 : 0.7
  }
  
  return Math.round(result * 100) / 100 // Round to 2 decimal places
}

// ─── Main Genetics Engine ────────────────────────────

interface ParentGenetics {
  color: string
  colorName: string
  personality: string
  baseHungerRate: number
  baseMoodRate: number
  baseEnergyRate: number
  growthSpeed: number
}

export interface ChildGenetics extends ParentGenetics {
  // Mendelian details
  alleles: Record<string, { pair: string; expressed: string }>
  isMutant: boolean
  generation: number
}

/**
 * Mendelian Genetics Simulation — advanced inheritance system.
 * 
 * Features:
 * - Dominant/recessive allele inheritance (Punnett square)
 * - 1% base mutation rate (increases per generation)
 * - Personality blending
 * - Numeric trait averaging with random variation
 * - Carrier genes (hidden recessive traits)
 */
export function combineGenetics(
  parentA: ParentGenetics,
  parentB: ParentGenetics,
  generation: number = 0
): ChildGenetics {
  const isMutant = rollForMutation(generation)
  
  // ── Allele inheritance ──
  const colorPrimaryPair = createAllelePair(
    TRAIT_ALLELES.colorPrimary.dominant,
    TRAIT_ALLELES.colorPrimary.recessive
  )
  const colorSecondaryPair = createAllelePair(
    TRAIT_ALLELES.colorSecondary.dominant,
    TRAIT_ALLELES.colorSecondary.recessive
  )
  const patternPair = createAllelePair(
    TRAIT_ALLELES.pattern.dominant,
    TRAIT_ALLELES.pattern.recessive
  )
  
  // ── Color expression ──
  const expressedPrimary = expressAllele(colorPrimaryPair)
  const expressedSecondary = expressAllele(colorSecondaryPair)
  const expressedPattern = expressAllele(patternPair)
  
  // Map expressed alleles to actual colors
  const colorMap: Record<string, string> = {
    'R': parentA.color,      // Default to parent A's color if dominant Red
    'r': parentB.color,      // Default to parent B's color if recessive Blue
    'G': '#FFD700',          // Gold
    'g': '#4CAF50',          // Green
    'S': parentA.color,      // Solid → main color
    's': parentB.color,      // Spotted → secondary color
  }
  
  // Handling mutation: completely new color!
  const MUTATION_COLORS = [
    { color: '#E040FB', colorName: 'Purple Dream' },
    { color: '#00E5FF', colorName: 'Cyan Star' },
    { color: '#FF6D00', colorName: 'Solar Flare' },
    { color: '#00E676', colorName: 'Neon Sprout' },
    { color: '#D500F9', colorName: 'Cosmic Violet' },
  ]
  
  const primaryColor = isMutant
    ? MUTATION_COLORS[Math.floor(Math.random() * MUTATION_COLORS.length)].color
    : (colorMap[expressedPrimary] || parentA.color)
  
  // ── Color name ──
  const colorName = isMutant
    ? MUTATION_COLORS[Math.floor(Math.random() * MUTATION_COLORS.length)].colorName
    : (Math.random() > 0.5 ? parentA.colorName : parentB.colorName)
  
  // ── Personality ──
  const personality = combinePersonality(parentA.personality, parentB.personality)
  
  // ── Numeric traits ──
  const mutationRate = generation > 0 ? MUTATION_RATE * (1 + generation * 0.1) : MUTATION_RATE
  const baseHungerRate = averageWithMutation(parentA.baseHungerRate, parentB.baseHungerRate, mutationRate)
  const baseMoodRate = averageWithMutation(parentA.baseMoodRate, parentB.baseMoodRate, mutationRate)
  const baseEnergyRate = averageWithMutation(parentA.baseEnergyRate, parentB.baseEnergyRate, mutationRate)
  const growthSpeed = averageWithMutation(parentA.growthSpeed, parentB.growthSpeed, mutationRate)

  return {
    color: primaryColor,
    colorName: isMutant ? colorName : `${parentA.colorName}-${parentB.colorName} Mix`,
    personality,
    baseHungerRate,
    baseMoodRate,
    baseEnergyRate,
    growthSpeed,
    // Extended data
    alleles: {
      colorPrimary: { pair: colorPrimaryPair, expressed: expressedPrimary },
      colorSecondary: { pair: colorSecondaryPair, expressed: expressedSecondary },
      pattern: { pair: patternPair, expressed: expressedPattern },
    },
    isMutant,
    generation: generation + 1,
  }
}

/**
 * Get the human-readable genotype description
 */
export function describeGenotype(genetics: ChildGenetics): string[] {
  const lines: string[] = []
  
  for (const [trait, info] of Object.entries(genetics.alleles)) {
    const pair = info.pair
    const isHomozygous = pair[0] === pair[1]
    const isDominant = pair[0] === pair[0].toUpperCase()
    
    if (isHomozygous) {
      lines.push(`${trait}: ${isDominant ? 'Pure dominant' : 'Pure recessive'} (${pair})`)
    } else {
      lines.push(`${trait}: Hybrid (${pair}) — carrier of ${pair[1]}`)
    }
  }
  
  if (genetics.isMutant) {
    lines.push('🧬 MUTANT! This pet carries a rare genetic mutation.')
  }
  
  lines.push(`Generation: ${genetics.generation}`)
  
  return lines
}