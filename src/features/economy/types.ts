// Economy & Monetization Types

export interface CurrencyBalance {
  coins: number
  gems: number
}

export interface DailyReward {
  day: number
  coins: number
  gems: number
  bonus?: string
}

export interface BattlePassLevel {
  level: number
  freeReward: Reward
  premiumReward: Reward
  xpRequired: number
}

export interface Reward {
  type: 'coins' | 'gems' | 'item' | 'pet' | 'accessory' | 'decoration' | 'title'
  amount?: number
  itemId?: string
  itemName?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export interface BattlePass {
  id: string
  userId: string
  isPremium: boolean
  currentLevel: number
  currentXP: number
  totalXP: number
  seasonId: string
  seasonStart: string
  seasonEnd: string
  claimedFreeLevels: number[]
  claimedPremiumLevels: number[]
  createdAt: string
  updatedAt: string
}

export interface GachaPool {
  id: string
  name: string
  description: string
  items: GachaItem[]
  pityThreshold: number
  guaranteedPityItem: string
  costGems: number
  costCoins: number
  currency: 'gems' | 'coins'
  isActive: boolean
  startDate: string
  endDate: string
}

export interface GachaItem {
  id: string
  name: string
  type: 'pet' | 'accessory' | 'decoration' | 'cosmetic'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  probability: number // 0-1
  imageUrl?: string
}

export interface GachaPull {
  id: string
  userId: string
  poolId: string
  items: GachaItem[]
  currency: 'gems' | 'coins'
  cost: number
  pityCounter: number
  isPity: boolean
  createdAt: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  type: 'cosmetic' | 'accessory' | 'decoration' | 'pack' | 'starter'
  priceCoins?: number
  priceGems?: number
  currency: 'coins' | 'gems' | 'mixed'
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  imageUrl?: string
  isLimited: boolean
  isExclusive: boolean
  stock?: number
  maxPurchase?: number
  category: string
  tags: string[]
  isActive: boolean
  startDate?: string
  endDate?: string
}

export interface Purchase {
  id: string
  userId: string
  itemId: string
  itemType: string
  currency: 'coins' | 'gems'
  amount: number
  createdAt: string
}

export interface StarterPack {
  id: string
  name: string
  description: string
  price: number
  currency: 'usd'
  items: {
    coins?: number
    gems?: number
    items?: string[]
  }
  isOneTime: boolean
  isActive: boolean
  startDate: string
  endDate: string
}

export interface UserEconomy {
  userId: string
  coins: number
  gems: number
  totalCoinsEarned: number
  totalGemsEarned: number
  totalCoinsSpent: number
  totalGemsSpent: number
  lastDailyClaim: string | null
  dailyStreak: number
  battlePassId: string | null
  gachaPityCounters: Record<string, number>
  createdAt: string
  updatedAt: string
}