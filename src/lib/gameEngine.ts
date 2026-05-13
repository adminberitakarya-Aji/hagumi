import type {
  GameType,
  GameDifficulty,
  GameConfig,
  GameSession,
  GameReward,
  GameEvent,
  GameEngine as IGameEngine,
} from '@/types/game'

// ─── Game Configurations ───────────────────────────────

const GAME_CONFIGS: Record<GameType, GameConfig> = {
  sakura_catch: {
    id: 'sakura_catch',
    name: 'Sakura Catch',
    description: 'Catch falling sakura petals before they hit the ground!',
    minLevel: 1,
    maxLevel: 10,
    baseScore: 100,
    timeLimit: 60,
    energyCost: 15,
    moodGain: 25,
    hungerCost: 10,
  },
  memory_match: {
    id: 'memory_match',
    name: 'Memory Match',
    description: 'Match pairs of cards to test your memory!',
    minLevel: 1,
    maxLevel: 10,
    baseScore: 150,
    timeLimit: 90,
    energyCost: 10,
    moodGain: 20,
    hungerCost: 5,
  },
  feeding_frenzy: {
    id: 'feeding_frenzy',
    name: 'Feeding Frenzy',
    description: 'Feed your pet as fast as you can!',
    minLevel: 1,
    maxLevel: 10,
    baseScore: 120,
    timeLimit: 45,
    energyCost: 20,
    moodGain: 30,
    hungerCost: 15,
  },
}

// ─── Difficulty Settings ───────────────────────────────

const DIFFICULTY_MULTIPLIERS: Record<GameDifficulty, number> = {
  easy: 0.8,
  medium: 1.0,
  hard: 1.3,
  expert: 1.6,
}

// ─── Game Engine Class ─────────────────────────────────

export class GameEngine implements IGameEngine {
  config: GameConfig
  session: GameSession
  events: GameEvent[]
  private updateInterval: number | null = null
  private lastUpdateTime: number = 0

  constructor(gameType: GameType, userId: string, petId: string) {
    this.config = GAME_CONFIGS[gameType]
    this.session = this.createSession(gameType, userId, petId)
    this.events = []
  }

  private createSession(
    gameType: GameType,
    userId: string,
    petId: string
  ): GameSession {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId: gameType,
      userId,
      petId,
      state: 'menu',
      score: 0,
      level: 1,
      difficulty: 'medium',
      timeRemaining: this.config.timeLimit,
      startTime: Date.now(),
      completed: false,
      rewards: {
        coins: 0,
        gems: 0,
        experience: 0,
      },
    }
  }

  // ─── Core Methods ─────────────────────────────────────

  start(): void {
    if (this.session.state === 'playing') return

    this.session.state = 'playing'
    this.session.startTime = Date.now()
    this.lastUpdateTime = Date.now()
    
    this.addEvent('start', { timestamp: this.session.startTime })
    
    // Start game loop
    this.updateInterval = window.setInterval(() => {
      this.update(1000 / 60) // 60 FPS
    }, 1000 / 60)
  }

  pause(): void {
    if (this.session.state !== 'playing') return

    this.session.state = 'paused'
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  resume(): void {
    if (this.session.state !== 'paused') return

    this.session.state = 'playing'
    this.lastUpdateTime = Date.now()
    
    // Resume game loop
    this.updateInterval = window.setInterval(() => {
      this.update(1000 / 60)
    }, 1000 / 60)
  }

  end(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.session.state = this.session.score > 0 ? 'victory' : 'gameover'
    this.session.endTime = Date.now()
    this.session.completed = true

    // Calculate rewards
    this.session.rewards = this.calculateRewards()
    
    this.addEvent(this.session.state, {
      score: this.session.score,
      rewards: this.session.rewards,
    })
  }

  // ─── Game-Specific Methods ───────────────────────────

  update(deltaTime: number): void {
    if (this.session.state !== 'playing') return

    // Update time remaining
    this.session.timeRemaining -= deltaTime / 1000

    // Check for game over
    if (this.session.timeRemaining <= 0) {
      this.end()
      return
    }

    // Game-specific update logic should be implemented in subclasses
    this.onUpdate()
  }

  handleInput(): void {
    if (this.session.state !== 'playing') return

    // Game-specific input handling
    this.onInput()
  }

  getScore(): number {
    return this.session.score
  }

  getTimeRemaining(): number {
    return Math.max(0, this.session.timeRemaining)
  }

  // ─── Difficulty ─────────────────────────────────────

  setDifficulty(difficulty: GameDifficulty): void {
    if (this.session.state !== 'menu') return

    this.session.difficulty = difficulty
  }

  getDifficulty(): GameDifficulty {
    return this.session.difficulty
  }

  getDifficultyMultiplier(): number {
    return DIFFICULTY_MULTIPLIERS[this.session.difficulty]
  }

  // ─── Rewards ─────────────────────────────────────────

  calculateRewards(): GameReward {
    const multiplier = this.getDifficultyMultiplier()
    const baseScore = this.config.baseScore
    const scoreMultiplier = this.session.score / baseScore

    return {
      coins: Math.floor(10 * multiplier * scoreMultiplier),
      gems: Math.floor(2 * multiplier * scoreMultiplier),
      experience: Math.floor(25 * multiplier * scoreMultiplier),
    }
  }

  applyRewards(): void {
    // This should be implemented by the game system to apply rewards to pet
    console.log('Applying rewards:', this.session.rewards)
  }

  // ─── Event System ─────────────────────────────────────

  addEvent(type: GameEvent['type'], data?: unknown): void {
    this.events.push({
      type,
      timestamp: Date.now(),
      data,
    })
  }

  getEvents(): GameEvent[] {
    return this.events
  }

  // ─── Virtual Methods (to be overridden) ───────────────

  protected onUpdate(): void {
    // Override in subclasses
  }

  protected onInput(): void {
    // Override in subclasses
  }

  // ─── Utility Methods ───────────────────────────────────

  getProgress(): number {
    return 1 - (this.session.timeRemaining / this.config.timeLimit)
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.session.timeRemaining / 60)
    const seconds = Math.floor(this.session.timeRemaining % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  getFormattedScore(): string {
    return this.session.score.toLocaleString()
  }

  isGameOver(): boolean {
    return this.session.state === 'gameover' || this.session.state === 'victory'
  }

  isVictory(): boolean {
    return this.session.state === 'victory'
  }

  // ─── Static Methods ───────────────────────────────────

  static getGameConfig(gameType: GameType): GameConfig {
    return GAME_CONFIGS[gameType]
  }

  static getAllGameConfigs(): GameConfig[] {
    return Object.values(GAME_CONFIGS)
  }

  static getDifficultyMultiplier(difficulty: GameDifficulty): number {
    return DIFFICULTY_MULTIPLIERS[difficulty]
  }
}

// ─── Game Factory ─────────────────────────────────────

export function createGameEngine(
  gameType: GameType,
  userId: string,
  petId: string
): GameEngine {
  return new GameEngine(gameType, userId, petId)
}