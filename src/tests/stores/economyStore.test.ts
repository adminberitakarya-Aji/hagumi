import { useEconomyStore } from '@/features/economy/economyStore'
import type { GachaPull, Purchase } from '@/features/economy/types'
import { act } from '@testing-library/react'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

describe('useEconomyStore', () => {
  const mockUser = { id: 'test-user-id' }
  const mockSession = { user: mockUser }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: mockSession } })
    
    act(() => {
      useEconomyStore.setState({
        balance: { coins: 0, gems: 0 },
        userEconomy: null,
        battlePass: null,
        isLoading: false,
        error: null,
      })
    })
  })

  test('should initialize with default state', () => {
    const state = useEconomyStore.getState()
    expect(state.balance).toEqual({ coins: 0, gems: 0 })
    expect(state.isLoading).toBe(false)
  })

  test('addCoins should call rpc and update balance', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ error: null })

    await act(async () => {
      await useEconomyStore.getState().addCoins(100)
    })

    expect(supabase.rpc).toHaveBeenCalledWith('add_coins', {
      user_id: mockUser.id,
      amount: 100,
    })
    expect(useEconomyStore.getState().balance.coins).toBe(100)
  })

  test('spendCoins should call rpc and update balance', async () => {
    act(() => {
      useEconomyStore.setState({ balance: { coins: 500, gems: 0 } })
    })
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ error: null })

    await act(async () => {
      await useEconomyStore.getState().spendCoins(200)
    })

    expect(supabase.rpc).toHaveBeenCalledWith('spend_coins', {
      user_id: mockUser.id,
      amount: 200,
    })
    expect(useEconomyStore.getState().balance.coins).toBe(300)
  })

  test('claimDailyReward should call rpc and update balance', async () => {
    const mockReward = { day: 1, coins: 50, gems: 0 }
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ data: mockReward, error: null })

    let reward
    await act(async () => {
      reward = await useEconomyStore.getState().claimDailyReward()
    })

    expect(supabase.rpc).toHaveBeenCalledWith('claim_daily_reward', {
      user_id: mockUser.id,
    })
    expect(reward).toEqual(mockReward)
    expect(useEconomyStore.getState().balance.coins).toBe(50)
  })

  test('pullGacha should calculate results correctly', async () => {
    act(() => {
      useEconomyStore.setState({ balance: { coins: 0, gems: 1000 } })
    })
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ error: null })

    let pull: GachaPull | null = null
    await act(async () => {
      pull = await useEconomyStore.getState().pullGacha('seasonal_spring', 1)
    })

    expect(pull).toBeTruthy()
    expect(pull!.items).toHaveLength(1)
    expect(pull!.cost).toBe(100)
    expect(useEconomyStore.getState().balance.gems).toBe(900)
  })

  test('loadUserEconomy should fetch data from supabase', async () => {
    const mockData = { coins: 1500, gems: 50 }
    const mockSingle = jest.fn().mockResolvedValue({ data: mockData, error: null })
    const mockEq = jest.fn(() => ({ single: mockSingle }))
    const mockSelect = jest.fn(() => ({ eq: mockEq }))
    
    ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

    await act(async () => {
      await useEconomyStore.getState().loadUserEconomy()
    })

    expect(supabase.from).toHaveBeenCalledWith('profiles')
    expect(useEconomyStore.getState().balance).toEqual({ coins: 1500, gems: 50 })
  })

  test('addCoins should handle errors', async () => {
    const mockError = new Error('Database connection failed')
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ error: mockError })

    await expect(
      act(async () => {
        await useEconomyStore.getState().addCoins(100)
      })
    ).rejects.toThrow('Database connection failed')
  })

  test('spendCoins should handle errors', async () => {
    const mockError = new Error('Insufficient funds')
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ error: mockError })

    await expect(
      act(async () => {
        await useEconomyStore.getState().spendCoins(100)
      })
    ).rejects.toThrow('Insufficient funds')
  })

  test('loadBattlePass should fetch data and update state', async () => {
    const mockBattlePass = { id: 'bp-1', user_id: mockUser.id, level: 5, xp: 1200 }
    const mockSingle = jest.fn().mockResolvedValue({ data: mockBattlePass, error: null })
    const mockEq = jest.fn(() => ({ single: mockSingle }))
    const mockSelect = jest.fn(() => ({ eq: mockEq }))
    
    ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

    await act(async () => {
      await useEconomyStore.getState().loadBattlePass()
    })

    expect(useEconomyStore.getState().battlePass).toEqual(mockBattlePass)
    expect(useEconomyStore.getState().isLoading).toBe(false)
  })

  test('addBattlePassXP should call rpc and reload battle pass', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ error: null })
    const loadBattlePassSpy = jest.spyOn(useEconomyStore.getState(), 'loadBattlePass')

    await act(async () => {
      await useEconomyStore.getState().addBattlePassXP(500)
    })

    expect(supabase.rpc).toHaveBeenCalledWith('add_battle_pass_xp', {
      user_id: mockUser.id,
      xp: 500,
    })
    expect(loadBattlePassSpy).toHaveBeenCalled()
  })

  test('purchaseShopItem should correctly deduct gems', async () => {
    act(() => {
      useEconomyStore.setState({ balance: { coins: 1000, gems: 1000 } })
    })
    ;(supabase.rpc as jest.Mock).mockResolvedValue({ error: null })

    let purchase: Purchase | null = null
    await act(async () => {
      purchase = await useEconomyStore.getState().purchaseShopItem('cosmic_background')
    })

    expect(purchase).toBeTruthy()
    expect(purchase!.amount).toBe(500)
    expect(useEconomyStore.getState().balance.gems).toBe(500)
  })
})
