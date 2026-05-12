import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface MarketListing {
  id: string
  seller_id: string
  item_type: string
  item_id: string
  price_coins: number
  price_gems: number
  currency: 'coins' | 'gems' | 'mixed'
  status: 'active' | 'sold' | 'cancelled'
  buyer_id: string | null
  profiles?: { display_name: string }
  created_at: string
  expires_at: string
}

interface MarketStore {
  listings: MarketListing[]
  isLoading: boolean
  error: string | null
  loadListings: () => Promise<void>
}

export const useMarketStore = create<MarketStore>((set) => ({
  listings: [],
  isLoading: false,
  error: null,
  loadListings: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('market_listings')
        .select('*, profiles(display_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[MarketStore] Load error:', error.message)
        set({ error: error.message, isLoading: false })
        return
      }
      
      if (data) set({ listings: data as MarketListing[], isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[MarketStore] Unexpected error:', message)
      set({ error: message, isLoading: false })
    }
  }
}))
