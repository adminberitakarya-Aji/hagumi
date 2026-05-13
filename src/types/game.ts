// ─── Game Types ───────────────────────────────────────

export type GameType = 'sakura_catch' | 'memory_match' | 'feeding_frenzy'

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'

export interface GameConfig {
  id: GameType
  name: string
  description: string
  minLevel: number
  maxLevel: number
  baseScore: number
  timeLimit: number // in seconds
  energyCost: number
  moodGain: number
  hungerCost: number
}

export interface GameSession {
  id: string
  gameId: GameType
  userId: string
  petId: string
  state: GameState
  score: number
  level: number
  difficulty: GameDifficulty
  timeRemaining: number
  startTime: number
  endTime?: number
  completed: boolean
  rewards: GameReward
}

export interface GameReward {
  coins: number
  gems: number
  experience: number
  items?: string[]
}

export interface GameStats {
  totalGamesPlayed: number
  totalScore: number
  highScore: number
  gamesWon: number
  gamesLost: number
  averageScore: number
  playTime: number // in seconds
}

export interface GameLeaderboard {
  gameId: GameType
  entries: Array<{
    userId: string
    petId: string
    petName: string
    score: number
    timestamp: number
  }>
}

export interface GameEvent {
  type: 'start' | 'score' | 'combo' | 'powerup' | 'gameover' | 'victory'
  timestamp: number
  data?: unknown
}

export interface GameEngine {
  config: GameConfig
  session: GameSession
  events: GameEvent[]
  
  // Core methods
  start(): void
  pause(): void
  resume(): void
  end(): void
  
  // Game-specific methods
  update(deltaTime: number): void
  handleInput(input: unknown): void
  getScore(): number
  getTimeRemaining(): number
  
  // Difficulty
  setDifficulty(difficulty: GameDifficulty): void
  getDifficulty(): GameDifficulty
  
  // Rewards
  calculateRewards(): GameReward
  applyRewards(): void
}

export interface MiniGameComponent {
  gameType: GameType
  render(): React.ReactNode
  onMount?(): void
  onUnmount?(): void
  onInput?(input: unknown): void
  onUpdate?(deltaTime: number): void
}
