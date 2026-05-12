import { usePetStore } from '@/stores/petStore'
import { Pet } from '@/types'

describe('petStore', () => {
  const mockPet: Pet = {
    id: 'pet-1',
    name: 'Hagumi',
    type: 'original',
    stage: 'egg',
    dayAge: 0,
    stats: {
      hunger: 50,
      mood: 50,
      energy: 50,
      health: 100
    },
    ownerId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  beforeEach(() => {
    usePetStore.setState({ pet: null, isLoading: false })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with null pet', () => {
    const state = usePetStore.getState()
    expect(state.pet).toBeNull()
  })

  it('should set a pet correctly', () => {
    usePetStore.getState().setPet(mockPet)
    expect(usePetStore.getState().pet).toEqual(mockPet)
  })

  it('should update stats and clamp values to [0, 100]', () => {
    usePetStore.getState().setPet(mockPet)
    
    // Test increase and clamping
    usePetStore.getState().updateStats({ hunger: 150 })
    expect(usePetStore.getState().pet?.stats.hunger).toBe(100)

    // Test decrease and clamping
    usePetStore.getState().updateStats({ mood: -50 })
    expect(usePetStore.getState().pet?.stats.mood).toBe(0)

    // Test partial update
    usePetStore.getState().updateStats({ energy: 75 })
    expect(usePetStore.getState().pet?.stats.energy).toBe(75)
    expect(usePetStore.getState().pet?.stats.hunger).toBe(100) // Stays clamped
  })

  it('should round stats to integers', () => {
    usePetStore.getState().setPet(mockPet)
    usePetStore.getState().updateStats({ health: 85.7 })
    expect(usePetStore.getState().pet?.stats.health).toBe(86)
  })

  it('should not update if pet is null', () => {
    usePetStore.getState().updateStats({ hunger: 10 })
    expect(usePetStore.getState().pet).toBeNull()
  })

  it('should update the updatedAt timestamp on changes', () => {
    usePetStore.getState().setPet(mockPet)
    const oldTimestamp = usePetStore.getState().pet?.updatedAt
    
    // Simulate time passing
    jest.advanceTimersByTime(1000)
    
    usePetStore.getState().updateStats({ hunger: 60 })
    const newTimestamp = usePetStore.getState().pet?.updatedAt
    
    expect(newTimestamp).not.toBe(oldTimestamp)
  })
})
