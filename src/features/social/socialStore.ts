import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Friend, FriendRequest, ChatMessage, Visitor, Gift, ReactionType } from './types'

interface SocialStore {
  // Friends
  friends: Friend[]
  friendRequests: FriendRequest[]
  pendingRequests: FriendRequest[]
  searchResults: Friend[]
  
  // Chat
  chatMessages: ChatMessage[]
  chatFilter: string
  
  // Visits
  recentVisitors: Visitor[]
  
  // Gifts
  gifts: Gift[]
  unreadGiftCount: number
  
  // UI
  isLoading: boolean
  error: string | null
  
  // Actions
  loadFriends: () => Promise<void>
  loadFriendRequests: () => Promise<void>
  searchUsers: (query: string) => Promise<void>
  sendFriendRequest: (userId: string) => Promise<void>
  acceptFriendRequest: (requestId: string) => Promise<void>
  rejectFriendRequest: (requestId: string) => Promise<void>
  removeFriend: (friendId: string) => Promise<void>
  
  sendChatMessage: (message: string) => void
  setChatFilter: (filter: string) => void
  
  recordVisit: (hostId: string) => Promise<void>
  leaveReaction: (visitId: string, reaction: ReactionType) => Promise<void>
  
  sendGift: (toUserId: string, itemType: string, itemName: string, message?: string) => Promise<void>
  markGiftRead: (giftId: string) => void
}

const MOCK_FRIENDS: Friend[] = [
  {
    id: '1', userId: 'user2', displayName: 'SakuraChan', nickname: 'Sakura',
    avatarUrl: null, petCount: 3, currentPetName: 'Mochi', currentPetStage: 'adult',
    currentPetColor: '#ffb7c5', lastActive: new Date(Date.now() - 300000).toISOString(),
    isOnline: true, friendshipDate: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: '2', userId: 'user3', displayName: 'YukiNoir', nickname: 'Yuki',
    avatarUrl: null, petCount: 2, currentPetName: 'Kuro', currentPetStage: 'teen',
    currentPetColor: '#2c3e50', lastActive: new Date(Date.now() - 7200000).toISOString(),
    isOnline: false, friendshipDate: new Date(Date.now() - 1209600000).toISOString(),
  },
  {
    id: '3', userId: 'user4', displayName: 'HaruMizu', nickname: 'Haru',
    avatarUrl: null, petCount: 5, currentPetName: 'Matcha', currentPetStage: 'baby',
    currentPetColor: '#8fbc8f', lastActive: new Date(Date.now() - 86400000).toISOString(),
    isOnline: false, friendshipDate: new Date(Date.now() - 2592000000).toISOString(),
  },
]

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      friends: [],
      friendRequests: [],
      pendingRequests: [],
      searchResults: [],
      chatMessages: [
        {
          id: 'sys-1', userId: 'system', displayName: 'System', avatarUrl: null,
          message: '🌸 Welcome to Hagumi Chat! Be kind and respectful to fellow pet lovers.',
          timestamp: new Date().toISOString(), type: 'system', isModerated: false,
        },
      ],
      chatFilter: 'all',
      recentVisitors: [],
      gifts: [],
      unreadGiftCount: 0,
      isLoading: false,
      error: null,

      loadFriends: async () => {
        set({ isLoading: true, error: null })
        try {
          // Try Supabase first, fallback to mock data
          const { data, error } = await supabase
            .from('friendship')
            .select('*, profiles!inner(display_name, nickname, avatar_url)')
            .eq('status', 'accepted')
            .limit(50)
          
          if (error) throw error
          
          if (data && data.length > 0) {
            const friends: Friend[] = data.map((f: { id: string; friend_id: string; profiles: { display_name: string; nickname: string; avatar_url: string | null }; created_at: string }) => ({
              id: f.id, userId: f.friend_id,
              displayName: f.profiles?.display_name || 'Unknown',
              nickname: f.profiles?.nickname || '',
              avatarUrl: f.profiles?.avatar_url || null,
              petCount: 0, currentPetName: null, currentPetStage: null,
              currentPetColor: null, lastActive: f.created_at,
              isOnline: false, friendshipDate: f.created_at,
            }))
            set({ friends, isLoading: false })
          } else {
            // Fallback to mock
            set({ friends: MOCK_FRIENDS, isLoading: false })
          }
        } catch {
          console.warn('[SocialStore] Using mock data (Supabase unavailable)')
          set({ friends: MOCK_FRIENDS, isLoading: false })
        }
      },

      loadFriendRequests: async () => {
        try {
          const { data } = await supabase
            .from('friendship')
            .select('*, profiles!inner(display_name, nickname, avatar_url)')
            .eq('status', 'pending')
          
          if (data) {
            set({ friendRequests: data.map((r: { id: string; user_id: string; profiles: { display_name: string; nickname: string }; created_at: string }) => ({
              id: r.id, fromUserId: r.user_id,
              fromDisplayName: r.profiles?.display_name || 'Unknown',
              fromNickname: r.profiles?.nickname || '',
              fromAvatarUrl: null, status: 'pending' as const,
              sentAt: r.created_at,
            }))})
          }
        } catch (err) {
          console.error('[SocialStore] Failed to load requests:', err)
        }
      },

      searchUsers: async (query) => {
        if (!query.trim()) { set({ searchResults: [] }); return }
        try {
          const { data } = await supabase
            .from('profiles')
            .select('id, display_name, nickname, avatar_url')
            .or(`display_name.ilike.%${query}%,nickname.ilike.%${query}%`)
            .limit(10)
          
          if (data) {
            set({ searchResults: data.map((p: { id: string; display_name: string; nickname: string; avatar_url: string | null }) => ({
              id: p.id, userId: p.id, displayName: p.display_name,
              nickname: p.nickname || '', avatarUrl: p.avatar_url || null,
              petCount: 0, currentPetName: null, currentPetStage: null,
              currentPetColor: null, lastActive: '', isOnline: false,
              friendshipDate: '',
            }))})
          }
        } catch {
          set({ searchResults: [] })
        }
      },

      sendFriendRequest: async (userId) => {
        try {
          const { error } = await supabase.from('friendship').insert({
            user_id: userId, friend_id: userId, status: 'pending'
          })
          if (error) console.error('[SocialStore] Send request error:', error.message)
        } catch (err) {
          console.error('[SocialStore] Failed to send request:', err)
        }
      },

      acceptFriendRequest: async (requestId) => {
        try {
          await supabase.from('friendship').update({ status: 'accepted' }).eq('id', requestId)
          set((state) => ({
            friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
          }))
          get().loadFriends()
        } catch (err) {
          console.error('[SocialStore] Accept error:', err)
        }
      },

      rejectFriendRequest: async (requestId) => {
        try {
          await supabase.from('friendship').update({ status: 'rejected' }).eq('id', requestId)
          set((state) => ({
            friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
          }))
        } catch (err) {
          console.error('[SocialStore] Reject error:', err)
        }
      },

      removeFriend: async (friendId) => {
        set((state) => ({ friends: state.friends.filter((f) => f.id !== friendId) }))
        try {
          await supabase.from('friendship').delete().eq('id', friendId)
        } catch (err) {
          console.error('[SocialStore] Remove error:', err)
          get().loadFriends() // Rollback
        }
      },

      sendChatMessage: (message) => {
        const msg: ChatMessage = {
          id: crypto.randomUUID(),
          userId: 'current-user',
          displayName: 'You',
          avatarUrl: null,
          message: message.trim(),
          timestamp: new Date().toISOString(),
          type: 'user',
          isModerated: false,
        }
        set((state) => ({ chatMessages: [...state.chatMessages, msg] }))
      },

      setChatFilter: (filter) => set({ chatFilter: filter }),

      recordVisit: async (hostId) => {
        try {
          await supabase.from('visits').insert({
            host_id: hostId, visitor_id: 'current-user',
            duration_seconds: 0, interactions_count: 0,
          })
        } catch (err) {
          console.error('[SocialStore] Record visit error:', err)
        }
      },

      leaveReaction: async (visitId, reaction) => {
        try {
          await supabase.from('visits').update({ left_reaction: reaction }).eq('id', visitId)
        } catch (err) {
          console.error('[SocialStore] Reaction error:', err)
        }
      },

      sendGift: async (toUserId, itemType, itemName, message) => {
        const gift: Gift = {
          id: crypto.randomUUID(),
          fromUserId: 'current-user',
          fromDisplayName: 'You',
          toUserId,
          itemType,
          itemName,
          message: message || null,
          sentAt: new Date().toISOString(),
          isRead: false,
        }
        set((state) => ({ gifts: [...state.gifts, gift], unreadGiftCount: state.unreadGiftCount + 1 }))
        try {
          await supabase.from('gifts').insert({
            from_user_id: 'current-user', to_user_id: toUserId,
            item_type: itemType, item_name: itemName, message,
          })
        } catch (err) {
          console.error('[SocialStore] Send gift error:', err)
        }
      },

      markGiftRead: (giftId) => {
        set((state) => ({
          gifts: state.gifts.map((g) => g.id === giftId ? { ...g, isRead: true } : g),
          unreadGiftCount: Math.max(0, state.unreadGiftCount - 1),
        }))
      },
    }),
    { name: 'hagumi-social-storage' }
  )
)