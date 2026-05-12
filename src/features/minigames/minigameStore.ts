import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MiniGame, MiniGameId, MiniGameDifficulty, Reward, MiniGameSession, MiniGameState } from './types'

// ─── Mini-Game Definitions ─────────────────────────────

const MINI_GAMES: Record<MiniGameId, MiniGame> = {
  'sakura-catch': {
    id: 'sakura-catch',
    name: 'Sakura Catch',
    description: 'Catch falling sakura petals before they hit the ground!',
    icon: '🌸',
    durationSeconds: 60,
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
    scoreAlgorithm: (input: { caught: number; missed: number }) => {
      const total = input.caught + input.missed
      if (total === 0) return 0
      const accuracy = input.caught / total
      return Math.round(accuracy * 1000)
    },
    rewardTable: [
      { minScore: 0, maxScore: 300, rewards: [{ type: 'coins', amount: 10, probability: 1 }] },
      { minScore: 300, maxScore: 600, rewards: [{ type: 'coins', amount: 20, probability: 1 }] },
      { minScore: 600, maxScore: 800, rewards: [{ type: 'coins', amount: 30, probability: 1 }, { type: 'item', amount: 1, itemId: 'rare-food', probability: 0.3 }] },
      { minScore: 800, maxScore: 1000, rewards: [{ type: 'coins', amount: 50, probability: 1 }, { type: 'gems', amount: 1, probability: 0.5 }] },
    ],
    statChanges: { mood: 20, energy: -5 },
    energyCost: 10,
    cooldownMinutes: 5,
  },
  'memory-match': {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Find matching pairs of cards to boost your pet\'s intelligence!',
    icon: '🧠',
    durationSeconds: 90,
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
    scoreAlgorithm: (input: { pairs: number; totalPairs: number; timeUsed: number }) => {
      const pairScore = (input.pairs / input.totalPairs) * 700
      const timeBonus = Math.max(0, 300 - input.timeUsed)
      return Math.round(pairScore + timeBonus)
    },
    rewardTable: [
      { minScore: 0, maxScore: 400, rewards: [{ type: 'coins', amount: 15, probability: 1 }] },
      { minScore: 400, maxScore: 700, rewards: [{ type: 'coins', amount: 25, probability: 1 }, { type: 'xp', amount: 10, probability: 1 }] },
      { minScore: 700, maxScore: 900, rewards: [{ type: 'coins', amount: 40, probability: 1 }, { type: 'gems', amount: 1, probability: 0.3 }] },
      { minScore: 900, maxScore: 1000, rewards: [{ type: 'coins', amount: 60, probability: 1 }, { type: 'gems', amount: 2, probability: 0.5 }] },
    ],
    statChanges: { mood: 15, energy: -10 },
    energyCost: 15,
    cooldownMinutes: 10,
  },
  'feeding-frenzy': {
    id: 'feeding-frenzy',
    name: 'Feeding Frenzy',
    description: 'Swipe and drag to feed your pet as much as possible!',
    icon: '🍖',
    durationSeconds: 45,
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
    scoreAlgorithm: (input: { fed: number; missed: number; combo: number }) => {
      const baseScore = input.fed * 50
      const comboBonus = input.combo * 20
      const penalty = input.missed * 10
      return Math.max(0, baseScore + comboBonus - penalty)
    },
    rewardTable: [
      { minScore: 0, maxScore: 300, rewards: [{ type: 'coins', amount: 20, probability: 1 }] },
      { minScore: 300, maxScore: 600, rewards: [{ type: 'coins', amount: 35, probability: 1 }, { type: 'item', amount: 1, itemId: 'food', probability: 0.5 }] },
      { minScore: 600, maxScore: 800, rewards: [{ type: 'coins', amount: 50, probability: 1 }, { type: 'item', amount: 1, itemId: 'rare-food', probability: 0.4 }] },
      { minScore: 800, maxScore: 1000, rewards: [{ type: 'coins', amount: 80, probability: 1 }, { type: 'gems', amount: 2, probability: 0.4 }] },
    ],
    statChanges: { hunger: 30, mood: 10, energy: -15 },
    energyCost: 20,
    cooldownMinutes: 15,
  },
  'hide-seek': {
    id: 'hide-seek',
    name: 'Hide & Seek',
    description: 'Find your pet hiding in the scene to strengthen your bond!',
    icon: '🙈',
    durationSeconds: 120,
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
    scoreAlgorithm: (input: { found: number; total: number; hintsUsed: number }) => {
      const foundScore = (input.found / input.total) * 600
      const hintPenalty = input.hintsUsed * 50
      return Math.max(0, foundScore - hintPenalty)
    },
    rewardTable: [
      { minScore: 0, maxScore: 300, rewards: [{ type: 'coins', amount: 15, probability: 1 }] },
      { minScore: 300, maxScore: 600, rewards: [{ type: 'coins', amount: 30, probability: 1 }, { type: 'item', amount: 1, itemId: 'toy', probability: 0.3 }] },
      { minScore: 600, maxScore: 800, rewards: [{ type: 'coins', amount: 45, probability: 1 }, { type: 'item', amount: 1, itemId: 'cosmetic', probability: 0.2 }] },
      { minScore: 800, maxScore: 1000, rewards: [{ type: 'coins', amount: 70, probability: 1 }, { type: 'gems', amount: 2, probability: 0.4 }] },
    ],
    statChanges: { mood: 25, energy: -8 },
    energyCost: 12,
    cooldownMinutes: 20,
  },
  'pet-dance': {
    id: 'pet-dance',
    name: 'Pet Dance',
    description: 'Rhythm game! Tap to the beat and make your pet dance!',
    icon: '💃',
    durationSeconds: 90,
    minDifficulty: 'easy',
    maxDifficulty: 'hard',
    scoreAlgorithm: (input: { hits: number; misses: number; perfectHits: number }) => {
      const total = input.hits + input.misses
      if (total === 0) return 0
      const accuracy = input.hits / total
      const perfectBonus = input.perfectHits * 30
      return Math.round(accuracy * 700 + perfectBonus)
    },
    rewardTable: [
      { minScore: 0, maxScore: 400, rewards: [{ type: 'coins', amount: 20, probability: 1 }] },
      { minScore: 400, maxScore: 700, rewards: [{ type: 'coins', amount: 35, probability: 1 }, { type: 'item', amount: 1, itemId: 'accessory', probability: 0.3 }] },
      { minScore: 700, maxScore: 900, rewards: [{ type: 'coins', amount: 55, probability: 1 }, { type: 'item', amount: 1, itemId: 'rare-accessory', probability: 0.2 }] },
      { minScore: 900, maxScore: 1000, rewards: [{ type: 'coins', amount: 80, probability: 1 }, { type: 'gems', amount: 3, probability: 0.5 }] },
    ],
    statChanges: { mood: 40, energy: -20 },
    energyCost: 25,
    cooldownMinutes: 30,
  },
}

// ─── Store ───────────────────────────────────────────

interface MiniGameStore {
  // State
  state: MiniGameState
  sessions: MiniGameSession[]
  cooldowns: Partial<Record<MiniGameId, number>>  // timestamp when cooldown ends
  
  // Actions
  getGame: (id: MiniGameId) => MiniGame | undefined
  startGame: (gameId: MiniGameId, difficulty: MiniGameDifficulty) => void
  endGame: (playerInput: any) => Reward[]
  updateScore: (score: number) => void
  updateSessionData: (data: any) => void
  getCooldownRemaining: (gameId: MiniGameId) => number
  canPlayGame: (gameId: MiniGameId) => boolean
  getHighScores: (gameId: MiniGameId) => number[]
}

export const useMiniGameStore = create<MiniGameStore>()(
  persist(
    (set, get) => ({
      state: {
        isPlaying: false,
        currentGame: null,
        score: 0,
        timeRemaining: 0,
        difficulty: 'easy',
        sessionData: null,
      },
      sessions: [],
      cooldowns: {},

      getGame: (id) => MINI_GAMES[id],

      startGame: (gameId, difficulty) => {
        const game = MINI_GAMES[gameId]
        if (!game) return

        const now = Date.now()
        const cooldownEnd = get().cooldowns[gameId] || 0
        if (now < cooldownEnd) return

        set({
          state: {
            isPlaying: true,
            currentGame: gameId,
            score: 0,
            timeRemaining: game.durationSeconds,
            difficulty,
            sessionData: null,
          },
        })
      },

      endGame: (playerInput) => {
        const { state } = get()
        if (!state.currentGame) return []

        const game = MINI_GAMES[state.currentGame]
        const finalScore = game.scoreAlgorithm(playerInput)

        // Calculate rewards
        let rewards: Reward[] = []
        for (const tier of game.rewardTable) {
          if (finalScore >= tier.minScore && finalScore <= tier.maxScore) {
            rewards = tier.rewards.filter(() => Math.random() < (rewards[0]?.probability || 1))
            break
          }
        }

        // Set cooldown
        const cooldownEnd = Date.now() + game.cooldownMinutes * 60 * 1000
        set((prev) => ({
          cooldowns: { ...prev.cooldowns, [state.currentGame!]: cooldownEnd },
          state: { ...prev.state, isPlaying: false, score: finalScore },
          sessions: [
            ...prev.sessions,
            {
              id: crypto.randomUUID(),
              gameId: state.currentGame!,
              userId: 'current-user',
              petId: 'current-pet',
              difficulty: state.difficulty,
              score: finalScore,
              startedAt: new Date().toISOString(),
              endedAt: new Date().toISOString(),
              rewards,
              statChanges: game.statChanges,
            },
          ],
        }))

        return rewards
      },

      updateScore: (score) => {
        set((prev) => ({
          state: { ...prev.state, score },
        }))
      },

      updateSessionData: (data) => {
        set((prev) => ({
          state: { ...prev.state, sessionData: data },
        }))
      },

      getCooldownRemaining: (gameId) => {
        const cooldownEnd = get().cooldowns[gameId] || 0
        const now = Date.now()
        return Math.max(0, cooldownEnd - now)
      },

      canPlayGame: (gameId) => {
        const remaining = get().getCooldownRemaining(gameId)
        return remaining === 0
      },

      getHighScores: (gameId) => {
        const sessions = get().sessions.filter((s) => s.gameId === gameId)
        return sessions
          .map((s) => s.score)
          .sort((a, b) => b - a)
          .slice(0, 5)
      },
    }),
    { name: 'hagumi-minigame-storage' }
  )
)