export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder' | 'dead'

export interface PetStats {
  hunger: number
  mood: number
  energy: number
  health: number
  growth: number
  warmth?: number
}

export interface PetGenetics {
  color: string
  colorName: string
  personality: string
  baseHungerRate: number
  baseMoodRate: number
  baseEnergyRate: number
  growthSpeed: number
}

export interface Pet {
  id: string
  userId: string
  name: string
  gender: 'male' | 'female'
  stage: PetStage
  genetics: PetGenetics
  stats: PetStats
  dayAge: number
  totalInteractions: number
  lastFed: string
  lastPlayed: string
  lastRested: string
  lastCleaned: string
  bornAt: string
  diedAt?: string
  createdAt: string
  updatedAt: string
  message?: string
}

export interface User {
  id: string
  email: string
  displayName: string
  coins: number
  gems: number
}
