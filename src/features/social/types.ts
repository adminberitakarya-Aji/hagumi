// ─── Social Types ─────────────────────────────────────

export interface Friend {
  id: string
  userId: string
  displayName: string
  nickname: string
  avatarUrl: string | null
  petCount: number
  currentPetName: string | null
  currentPetStage: string | null
  currentPetColor: string | null
  lastActive: string
  isOnline: boolean
  friendshipDate: string
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromDisplayName: string
  fromNickname: string
  fromAvatarUrl: string | null
  status: 'pending' | 'accepted' | 'rejected'
  sentAt: string
}

export interface ChatMessage {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  message: string
  timestamp: string
  type: 'user' | 'system'
  isModerated: boolean
}

export interface Visitor {
  id: string
  visitorId: string
  displayName: string
  avatarUrl: string | null
  petName: string
  visitedAt: string
  durationSeconds: number
  message: string | null
  reaction: string | null
}

export type ReactionType = '❤️' | '🌸' | '✨' | '🌟' | '🎀' | '💫'

export interface Gift {
  id: string
  fromUserId: string
  fromDisplayName: string
  toUserId: string
  itemType: string
  itemName: string
  message: string | null
  sentAt: string
  isRead: boolean
}