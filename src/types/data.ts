import type { PetStage } from './index'

export interface EggType {
  id: string
  name: string
  color: string
  personality: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const EGG_TYPES: EggType[] = [
  { id: 'mochi', name: 'Mochi', color: '#ffb7c5', personality: 'playful', rarity: 'common', description: 'Very soft and bouncy.' },
  { id: 'matcha', name: 'Matcha', color: '#8fbc8f', personality: 'calm', rarity: 'common', description: 'Smells like green tea.' },
  { id: 'yuzu', name: 'Yuzu', color: '#f1c40f', personality: 'energetic', rarity: 'rare', description: 'Full of citrus energy.' },
  { id: 'kuro', name: 'Kuro', color: '#2c3e50', personality: 'grumpy', rarity: 'rare', description: 'Dark and mysterious.' },
]

export const STAGE_CONFIGS: Record<PetStage, { label: string; minDays: number; maxDays: number }> = {
  egg:   { label: 'Egg',   minDays: 0,  maxDays: 0 },
  baby:  { label: 'Baby',  minDays: 0,  maxDays: 3 },
  child: { label: 'Child', minDays: 4,  maxDays: 10 },
  teen:  { label: 'Teen',  minDays: 11, maxDays: 20 },
  adult: { label: 'Adult', minDays: 21, maxDays: 60 },
  elder: { label: 'Elder', minDays: 61, maxDays: 80 },
  dead:  { label: 'Dead',  minDays: 81, maxDays: 999 },
}
