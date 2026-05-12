import { Pet, PetStats, PetStage } from '@/types'
import { STAGE_CONFIGS } from '@/types/data'

const GRACE_PERIOD_MS = 72 * 60 * 60 * 1000 // 72 hours

/**
 * Compute aging based on time since birth.
 * Stage progression depends on both dayAge AND average stats (care quality).
 * Well-cared pets evolve faster, neglected pets are delayed.
 */
export function computeAging(pet: Pet): { dayAge: number; stage: PetStage; stageUp: boolean } {
  const bornAt = new Date(pet.bornAt).getTime()
  const now = Date.now()
  const dayAge = Math.floor((now - bornAt) / 86_400_000)

  let newStage = pet.stage
  let stageUp = false

  // Calculate care quality modifier (0.0 to 1.0)
  const avgStats = (pet.stats.hunger + pet.stats.mood + pet.stats.energy + pet.stats.health) / 4
  const careQuality = avgStats / 100
  
  // Effective days = actual days × care quality modifier
  // A pet with 50% care = effectively advances half as fast
  const effectiveDays = dayAge * (0.5 + careQuality * 0.5) // range: 0.5× to 1.0×

  // Determine stage based on effective days
  for (const [stage, config] of Object.entries(STAGE_CONFIGS)) {
    if (effectiveDays >= config.minDays && effectiveDays <= config.maxDays) {
      if (newStage !== stage && stage !== 'egg' && stage !== 'dead') {
        newStage = stage as PetStage
        stageUp = true
      }
      break
    }
  }

  return { dayAge, stage: newStage, stageUp }
}

/**
 * Check if pet is in grace period (72 hours after critical stats hit 0).
 * During grace period, pet does NOT die — giving player time to revive.
 */
export function isInGracePeriod(pet: Pet): boolean {
  // Pet is only eligible for grace if hunger or health is critically low
  if (pet.stats.hunger > 0 && pet.stats.health > 0 && pet.stage !== 'dead') return false
  
  const lastUpdate = new Date(pet.updatedAt).getTime()
  const elapsed = Date.now() - lastUpdate
  return elapsed < GRACE_PERIOD_MS
}

/**
 * Enhanced death check with grace period.
 * Returns false if pet is in grace period (survives).
 */
export function checkDeath(pet: Pet, currentStats?: PetStats): boolean {
  const stats = currentStats || pet.stats
  
  // If pet is in grace period, they survive
  if (isInGracePeriod(pet)) {
    return false
  }
  
  // Pet dies if health or hunger reaches 0 outside grace period
  return stats.health <= 0 || stats.hunger <= 0
}

/**
 * Growth formula: Growth = care quality × genetics × time
 */
export function calculateGrowthProgress(pet: Pet): number {
  const avgStats = (pet.stats.hunger + pet.stats.mood + pet.stats.energy + pet.stats.health) / 4
  const careFactor = avgStats / 100  // 0.0 to 1.0
  const geneticsFactor = pet.genetics.growthSpeed || 1.0  // 0.5 to 2.0
  
  // Base progress per day = careFactor × geneticsFactor × 100
  return careFactor * geneticsFactor * 100
}
