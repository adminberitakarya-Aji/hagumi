import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  session: any | null
  isLoading: boolean
  setUser: (user: User | null) => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  loadUser: async () => {
    set({ isLoading: true })
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('[AuthStore] Session error:', sessionError.message)
        set({ isLoading: false })
        return
      }
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.error('[AuthStore] Profile fetch error:', profileError.message)
          set({ isLoading: false })
          return
        }
        
        if (profile) {
          set({
            user: {
              id: profile.id,
              email: profile.email,
              displayName: profile.display_name,
              coins: profile.coins,
              gems: profile.gems,
            }
          })
        }
      }
    } catch (err) {
      console.error('[AuthStore] Unexpected error:', err)
    } finally {
      set({ isLoading: false })
    }
  }
}))
