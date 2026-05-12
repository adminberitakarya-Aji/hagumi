// ─── Mini-Game Types ───────────────────────────────────

export type MiniGameId = 'sakura-catch' | 'memory-match' | 'feeding-frenzy' | 'hide-seek' | 'pet-dance'

export type MiniGameDifficulty = 'easy' | 'medium' | 'hard'

export type PlayerInput = 
  | { caught: number; missed: number }
  | { pairs: number; totalPairs: number; timeUsed: number }
  | { fed: number; missed: number; combo: number }
  | { found: number; total: number; hintsUsed: number }
  | { hits: number; misses: number; perfectHits: number }
  | Record<string, unknown>

export interface MiniGame {
  id: MiniGameId
  name: string
  description: string
  icon: string
  durationSeconds: number
  minDifficulty: MiniGameDifficulty
  maxDifficulty: MiniGameDifficulty
  
  // Scoring
  scoreAlgorithm: (playerInput: PlayerInput) => number
  rewardTable: {
    minScore: number
    maxScore: number
    rewards: Reward[]
  }[]
  
  // Stat impact
  statChanges: Partial<PetStats>
  energyCost: number
  cooldownMinutes: number
}

export interface Reward {
  type: 'coins' | 'gems' | 'item' | 'xp'
  amount: number
  itemId?: string
  probability: number  // 0-1
}

export interface PetStats {
  hunger: number
  mood: number
  energy: number
  health: number
  growth: number
}

export interface MiniGameSession {
  id: string
  gameId: MiniGameId
  userId: string
  petId: string
  difficulty: MiniGameDifficulty
  score: number
  startedAt: string
  endedAt: string
  rewards: Reward[]
  statChanges: Partial<PetStats>
}

export interface MiniGameState {
  isPlaying: boolean
  currentGame: MiniGameId | null
  score: number
  timeRemaining: number
  difficulty: MiniGameDifficulty
  sessionData: Record<string, unknown> | null
}