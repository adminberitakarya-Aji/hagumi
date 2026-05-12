// ─── Content Types ─────────────────────────────────────

export type PetLineId = 'mochi' | 'matcha' | 'yuzu' | 'kuro' | 'mizu' | 'honoo' | 'kaze' | 'tsuchi'

export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder'

export type ElementType = 'light' | 'nature' | 'energy' | 'shadow' | 'water' | 'fire' | 'wind' | 'earth'

export type ItemType = 'food' | 'toy' | 'decoration' | 'medicine' | 'cosmetic' | 'accessory' | 'rare-food' | 'rare-accessory'

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface PetLine {
  id: PetLineId
  name: string
  element: ElementType
  forms: string[]  // Names for each stage
  colors: {
    primary: string
    secondary: string
    pattern: string
  }
  personality: string
  description: string
  isUnlocked: boolean
}

export interface Item {
  id: string
  name: string
  type: ItemType
  rarity: ItemRarity
  description: string
  icon: string
  price: {
    coins?: number
    gems?: number
  }
  statChanges?: Partial<PetStats>
  isConsumable: boolean
  isEquippable: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'pet' | 'social' | 'economy' | 'minigame' | 'exploration'
  requirement: {
    type: 'stat' | 'count' | 'time' | 'score'
    target: number
    field?: string
  }
  reward: {
    coins?: number
    gems?: number
    item?: string
    title?: string
  }
  isUnlocked: boolean
  progress: number
  maxProgress: number
}

export interface PetStats {
  hunger: number
  mood: number
  energy: number
  health: number
  growth: number
}