import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DailyRewards from '@/components/DailyRewards'
import { useEconomyStore } from '@/features/economy/economyStore'

// Mock useEconomyStore
jest.mock('@/features/economy/economyStore', () => ({
  useEconomyStore: jest.fn(),
}))

describe('DailyRewards Component', () => {
  const mockClaimDailyReward = jest.fn()
  const mockGetDailyReward = jest.fn((day) => ({
    day,
    coins: 50,
    gems: 1,
    bonus: day === 7 ? 'Weekly Bonus' : null,
  }))

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useEconomyStore as unknown as jest.Mock).mockReturnValue({
      claimDailyReward: mockClaimDailyReward,
      getDailyReward: mockGetDailyReward,
      balance: { coins: 0, gems: 0 },
    })
  })

  test('renders daily rewards for 7 days', () => {
    render(<DailyRewards />)
    
    expect(screen.getByText('🎁 Daily Rewards')).toBeInTheDocument()
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(`Day ${i}`)).toBeInTheDocument()
    }
  })

  test('shows claim button for the current day', () => {
    render(<DailyRewards />)
    
    // Day 1 should have a claim button by default state in component
    const claimButtons = screen.getAllByRole('button', { name: /claim/i })
    expect(claimButtons).toHaveLength(1)
  })

  test('calls claimDailyReward when claim button is clicked', async () => {
    mockClaimDailyReward.mockResolvedValue({ coins: 50, gems: 1 })
    
    render(<DailyRewards />)
    
    const claimButton = screen.getByRole('button', { name: /claim/i })
    fireEvent.click(claimButton)
    
    expect(mockClaimDailyReward).toHaveBeenCalled()
    
    await waitFor(() => {
      expect(screen.getByText('Reward Claimed!')).toBeInTheDocument()
    })
    
    expect(screen.getByText('+50 Coins')).toBeInTheDocument()
    expect(screen.getByText('+1 Gems')).toBeInTheDocument()
  })

  test('disables claim button while claiming', async () => {
    // Mock a slow claim
    mockClaimDailyReward.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ coins: 50, gems: 1 }), 100)))
    
    render(<DailyRewards />)
    
    const claimButton = screen.getByRole('button', { name: /claim/i })
    fireEvent.click(claimButton)
    
    expect(claimButton).toBeDisabled()
    expect(claimButton).toHaveTextContent('Claiming...')
  })

  test('handles claim failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    mockClaimDailyReward.mockRejectedValue(new Error('Network Error'))
    
    render(<DailyRewards />)
    
    const claimButton = screen.getByRole('button', { name: /claim/i })
    fireEvent.click(claimButton)
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Claim failed. Please try again.')
    })
    
    consoleSpy.mockRestore()
    alertSpy.mockRestore()
  })
})
