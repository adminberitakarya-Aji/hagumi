import { useMiniGameStore } from '@/features/minigames/minigameStore'
import { act } from '@testing-library/react'

describe('useMiniGameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useMiniGameStore.setState({
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
      })
    })
  })

  test('should initialize with default state', () => {
    const state = useMiniGameStore.getState()
    expect(state.state.isPlaying).toBe(false)
    expect(state.state.currentGame).toBe(null)
    expect(state.sessions).toHaveLength(0)
  })

  test('should start a game correctly', () => {
    act(() => {
      useMiniGameStore.getState().startGame('sakura-catch', 'medium')
    })

    const state = useMiniGameStore.getState().state
    expect(state.isPlaying).toBe(true)
    expect(state.currentGame).toBe('sakura-catch')
    expect(state.difficulty).toBe('medium')
    expect(state.timeRemaining).toBe(60) // Sakura Catch duration
  })

  test('should not start a game if on cooldown', () => {
    const futureDate = Date.now() + 10000
    act(() => {
      useMiniGameStore.setState({
        cooldowns: { 'sakura-catch': futureDate }
      })
    })

    act(() => {
      useMiniGameStore.getState().startGame('sakura-catch', 'easy')
    })

    expect(useMiniGameStore.getState().state.isPlaying).toBe(false)
  })

  test('should end a game and calculate rewards', () => {
    act(() => {
      useMiniGameStore.getState().startGame('sakura-catch', 'easy')
    })

    // Mock perfect score
    const playerInput = { caught: 10, missed: 0 }
    
    let rewards
    act(() => {
      rewards = useMiniGameStore.getState().endGame(playerInput)
    })

    const store = useMiniGameStore.getState()
    expect(store.state.isPlaying).toBe(false)
    expect(store.state.score).toBe(1000) // Perfect accuracy -> 1000 points
    expect(store.sessions).toHaveLength(1)
    expect(store.cooldowns['sakura-catch']).toBeGreaterThan(Date.now())
  })

  test('should update score', () => {
    act(() => {
      useMiniGameStore.getState().updateScore(500)
    })

    expect(useMiniGameStore.getState().state.score).toBe(500)
  })

  test('should calculate high scores correctly', () => {
    act(() => {
      useMiniGameStore.setState({
        sessions: [
          { gameId: 'sakura-catch', score: 100 } as any,
          { gameId: 'sakura-catch', score: 300 } as any,
          { gameId: 'sakura-catch', score: 200 } as any,
          { gameId: 'memory-match', score: 500 } as any,
        ]
      })
    })

    const highScores = useMiniGameStore.getState().getHighScores('sakura-catch')
    expect(highScores).toEqual([300, 200, 100])
  })
})
