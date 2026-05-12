import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface PublicAdultPet {
  id: string
  user_id: string
  name: string
  stage: string
  gender: string
  genetics: Record<string, unknown>
  stats: Record<string, number>
  day_age: number
  profiles?: { display_name: string }
  created_at: string
}

interface BreedingStore {
  publicAdultPets: PublicAdultPet[]
  isLoading: boolean
  error: string | null
  loadPublicPets: () => Promise<void>
  sendBreedRequest: (myPetId: string, targetPetId: string) => Promise<void>
}

export const useBreedingStore = create<BreedingStore>((set) => ({
  publicAdultPets: [],
  isLoading: false,
  error: null,
  loadPublicPets: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, profiles(display_name)')
        .eq('stage', 'adult')
        .limit(20)
      
      if (error) {
        console.error('[BreedingStore] Load error:', error.message)
        set({ error: error.message, isLoading: false })
        return
      }
      
      if (data) set({ publicAdultPets: data as PublicAdultPet[], isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[BreedingStore] Unexpected error:', message)
      set({ error: message, isLoading: false })
    }
  },
  sendBreedRequest: async (myPetId, targetPetId) => {
    try {
      // In real app, this creates a record in breed_requests table
      console.log('[BreedingStore] Breed request sent from', myPetId, 'to', targetPetId)
      
      // Placeholder for actual API call:
      // const { error } = await supabase.from('breed_requests').insert({
      //   sender_pet_id: myPetId,
      //   receiver_pet_id: targetPetId,
      //   status: 'pending'
      // })
      // if (error) throw new Error(error.message)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[BreedingStore] Breed request error:', message)
      set({ error: message })
    }
  }
}))
