import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pet, PetStats } from '@/types'

interface PetStore {
  pet: Pet | null
  isLoading: boolean
  setPet: (pet: Pet | null) => void
  updateStats: (stats: Partial<PetStats>) => void
  syncToSupabase: () => Promise<void>
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pet: null,
      isLoading: false,
      setPet: (pet) => set({ pet }),
      updateStats: (statsUpdate) => {
        const { pet } = get()
        if (!pet) return
        // Clamp all numeric values to [0, 100] and prevent NaN
        const clampedStats: Record<string, number> = {}
        for (const [key, value] of Object.entries(statsUpdate)) {
          if (typeof value === 'number') {
            clampedStats[key] = Math.max(0, Math.min(100, isNaN(value) ? 0 : Math.round(value)))
          } else {
            clampedStats[key] = value as unknown as number
          }
        }
        set({
          pet: {
            ...pet,
            stats: { ...pet.stats, ...clampedStats },
            updatedAt: new Date().toISOString()
          }
        })
      },
      syncToSupabase: async () => {
        console.log('[petStore] syncToSupabase is disabled. Game is now Server-Authoritative.')
        // Backend Go will handle the database sync.
        return Promise.resolve()
      }
    }),
    { name: 'hagumi-pet-storage' }
  )
)
