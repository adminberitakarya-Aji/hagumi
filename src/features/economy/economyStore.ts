import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type {
  CurrencyBalance,
  DailyReward,
  BattlePass,
  BattlePassLevel,
  Reward,
  GachaPool,
  GachaItem,
  GachaPull,
  ShopItem,
  Purchase,
  StarterPack,
  UserEconomy
} from './types'

// Economy Configuration
export const ECONOMY_CONFIG = {
  dailyRewards: [
    { day: 1, coins: 50, gems: 0 },
    { day: 2, coins: 75, gems: 0 },
    { day: 3, coins: 100, gems: 1 },
    { day: 4, coins: 125, gems: 1 },
    { day: 5, coins: 150, gems: 2 },
    { day: 6, coins: 175, gems: 2 },
    { day: 7, coins: 300, gems: 5, bonus: 'Weekly Bonus' },
  ],
  
  battlePassXP: {
    level1: 100,
    level2: 250,
    level3: 450,
    level4: 700,
    level5: 1000,
    level10: 3000,
    level20: 8000,
    level30: 15000,
    level40: 24000,
    level50: 35000,
    level75: 60000,
    level100: 100000,
  },
  
  gemPackages: [
    { gems: 50, price: 0.99 },
    { gems: 150, price: 2.99 },
    { gems: 350, price: 4.99 },
    { gems: 800, price: 9.99 },
    { gems: 2000, price: 19.99 },
  ],
  
  marketFees: {
    listing: 0.05,
    saleFee: 0.10,
    auctionDeposit: 0.02,
  },
}

// Battle Pass Rewards Configuration
const BATTLE_PASS_REWARDS: BattlePassLevel[] = [
  { level: 5, freeReward: { type: 'coins', amount: 100 }, premiumReward: { type: 'coins', amount: 200 }, xpRequired: 1000 },
  { level: 10, freeReward: { type: 'gems', amount: 100 }, premiumReward: { type: 'gems', amount: 300 }, xpRequired: 3000 },
  { level: 20, freeReward: { type: 'item', itemId: 'egg_skin_common', itemName: 'Common Egg Skin', rarity: 'common' }, premiumReward: { type: 'item', itemId: 'egg_skin_rare', itemName: 'Rare Egg Skin', rarity: 'rare' }, xpRequired: 8000 },
  { level: 30, freeReward: { type: 'decoration', itemId: 'deco_common', itemName: 'Common Decoration', rarity: 'common' }, premiumReward: { type: 'decoration', itemId: 'deco_premium', itemName: 'Premium Room Set', rarity: 'epic' }, xpRequired: 15000 },
  { level: 40, freeReward: { type: 'accessory', itemId: 'acc_common', itemName: 'Pet Accessory', rarity: 'common' }, premiumReward: { type: 'accessory', itemId: 'acc_exclusive', itemName: 'Exclusive Accessory', rarity: 'legendary' }, xpRequired: 24000 },
  { level: 50, freeReward: { type: 'pet', itemId: 'pet_monthly_free', itemName: 'Monthly Pet (Free)', rarity: 'rare' }, premiumReward: { type: 'pet', itemId: 'pet_monthly_premium', itemName: 'Monthly Pet (Premium)', rarity: 'epic' }, xpRequired: 35000 },
  { level: 75, freeReward: { type: 'coins', amount: 500 }, premiumReward: { type: 'accessory', itemId: 'acc_legendary', itemName: 'Legendary Accessory', rarity: 'legendary' }, xpRequired: 60000 },
  { level: 100, freeReward: { type: 'title', itemId: 'title_veteran', itemName: 'Veteran Player' }, premiumReward: { type: 'item', itemId: 'skin_evolution_exclusive', itemName: 'Exclusive Evolution Skin', rarity: 'legendary' }, xpRequired: 100000 },
]

// Gacha Pool Configuration
const GACHA_POOLS: GachaPool[] = [
  {
    id: 'seasonal_spring',
    name: 'Spring Blossom Gacha',
    description: 'Limited spring-themed pets and accessories',
    items: [
      { id: 'pet_spring_1', name: 'Sakura Mochi', type: 'pet', rarity: 'legendary', probability: 0.01 },
      { id: 'acc_spring_1', name: 'Flower Crown', type: 'accessory', rarity: 'epic', probability: 0.03 },
      { id: 'acc_spring_2', name: 'Cherry Blossom Ribbon', type: 'accessory', rarity: 'rare', probability: 0.10 },
      { id: 'deco_spring_1', name: 'Sakura Tree', type: 'decoration', rarity: 'uncommon', probability: 0.20 },
      { id: 'cosmetic_spring_1', name: 'Spring Background', type: 'cosmetic', rarity: 'common', probability: 0.66 },
    ],
    pityThreshold: 90,
    guaranteedPityItem: 'pet_spring_1',
    costGems: 100,
    costCoins: 0,
    currency: 'gems',
    isActive: true,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
  },
  {
    id: 'mythical_dragons',
    name: 'Dragon\'s Hoard Gacha',
    description: 'Ancient mythical dragons and legendary artifacts',
    items: [
      { id: 'pet_dragon_void', name: 'Void Dragon', type: 'pet', rarity: 'legendary', probability: 0.005 },
      { id: 'pet_dragon_fire', name: 'Ember Wyrm', type: 'pet', rarity: 'epic', probability: 0.02 },
      { id: 'acc_dragon_wings', name: 'Draconic Wings', type: 'accessory', rarity: 'epic', probability: 0.05 },
      { id: 'deco_gold_pile', name: 'Pile of Gold', type: 'decoration', rarity: 'rare', probability: 0.15 },
      { id: 'cosmetic_volcano', name: 'Volcanic Lair', type: 'cosmetic', rarity: 'uncommon', probability: 0.30 },
      { id: 'item_dragon_scale', name: 'Dragon Scale', type: 'item', rarity: 'common', probability: 0.475 },
    ],
    pityThreshold: 120,
    guaranteedPityItem: 'pet_dragon_void',
    costGems: 150,
    costCoins: 0,
    currency: 'gems',
    isActive: true,
  },
  {
    id: 'daily_coins_pool',
    name: 'Lucky Coin Toss',
    description: 'Use your coins to get basic items and food',
    items: [
      { id: 'acc_lucky_charm', name: 'Lucky Charm', type: 'accessory', rarity: 'rare', probability: 0.05 },
      { id: 'food_premium', name: 'Premium Wagyu', type: 'food', rarity: 'uncommon', probability: 0.20 },
      { id: 'deco_plant', name: 'House Plant', type: 'decoration', rarity: 'common', probability: 0.35 },
      { id: 'food_basic', name: 'Basic Kibble', type: 'food', rarity: 'common', probability: 0.40 },
    ],
    pityThreshold: 50,
    guaranteedPityItem: 'acc_lucky_charm',
    costGems: 0,
    costCoins: 1000,
    currency: 'coins',
    isActive: true,
  },
]

// Shop Items Configuration
const SHOP_ITEMS: ShopItem[] = [
  // Backgrounds
  {
    id: 'cosmic_background', name: 'Cosmic Background', description: 'A beautiful cosmic background for your pet room',
    type: 'cosmetic', priceGems: 500, currency: 'gems', rarity: 'epic', isLimited: false, isExclusive: false, category: 'backgrounds', tags: ['cosmetic', 'background'], isActive: true,
  },
  {
    id: 'cyberpunk_city_bg', name: 'Cyberpunk City', description: 'Neon-lit futuristic city view',
    type: 'cosmetic', priceGems: 800, currency: 'gems', rarity: 'legendary', isLimited: false, isExclusive: true, category: 'backgrounds', tags: ['cosmetic', 'background', 'sci-fi'], isActive: true,
  },
  {
    id: 'enchanted_forest_bg', name: 'Enchanted Forest', description: 'A magical forest with glowing fireflies',
    type: 'cosmetic', priceGems: 400, currency: 'gems', rarity: 'rare', isLimited: false, isExclusive: false, category: 'backgrounds', tags: ['cosmetic', 'background', 'nature'], isActive: true,
  },
  {
    id: 'sunny_beach_bg', name: 'Sunny Beach', description: 'Relaxing beach with ocean waves',
    type: 'cosmetic', priceCoins: 5000, currency: 'coins', rarity: 'uncommon', isLimited: false, isExclusive: false, category: 'backgrounds', tags: ['cosmetic', 'background', 'summer'], isActive: true,
  },
  
  // Accessories
  {
    id: 'crown_accessory', name: 'Royal Crown', description: 'Make your pet feel like royalty',
    type: 'accessory', priceGems: 800, currency: 'gems', rarity: 'legendary', isLimited: false, isExclusive: false, category: 'accessories', tags: ['accessory', 'crown'], isActive: true,
  },
  {
    id: 'angel_wings', name: 'Angel Wings', description: 'Heavenly wings that flutter',
    type: 'accessory', priceGems: 1200, currency: 'gems', rarity: 'legendary', isLimited: true, isExclusive: true, category: 'accessories', tags: ['accessory', 'wings'], isActive: true,
  },
  {
    id: 'demon_horns', name: 'Demon Horns', description: 'Spooky horns for mischievous pets',
    type: 'accessory', priceGems: 600, currency: 'gems', rarity: 'epic', isLimited: false, isExclusive: false, category: 'accessories', tags: ['accessory', 'horns', 'spooky'], isActive: true,
  },
  {
    id: 'ninja_headband', name: 'Ninja Headband', description: 'For the stealthy ones',
    type: 'accessory', priceCoins: 8000, currency: 'coins', rarity: 'rare', isLimited: false, isExclusive: false, category: 'accessories', tags: ['accessory', 'ninja'], isActive: true,
  },
  {
    id: 'bowtie_accessory', name: 'Cute Bowtie', description: 'A stylish bowtie for your pet',
    type: 'accessory', priceCoins: 500, currency: 'coins', rarity: 'common', isLimited: false, isExclusive: false, category: 'accessories', tags: ['accessory', 'bowtie'], isActive: true,
  },
  
  // Decorations / Furniture
  {
    id: 'cozy_bed_premium', name: 'Premium Cozy Bed', description: 'Extra comfortable bed for your pet',
    type: 'decoration', priceGems: 400, currency: 'gems', rarity: 'rare', isLimited: false, isExclusive: false, category: 'furniture', tags: ['decoration', 'bed'], isActive: true,
  },
  {
    id: 'gaming_setup', name: 'Pro Gaming Setup', description: 'RGB PC and gaming chair',
    type: 'decoration', priceGems: 1500, currency: 'gems', rarity: 'legendary', isLimited: false, isExclusive: true, category: 'furniture', tags: ['decoration', 'gaming'], isActive: true,
  },
  {
    id: 'zen_garden', name: 'Mini Zen Garden', description: 'Brings peace and boosts mood recovery',
    type: 'decoration', priceGems: 600, currency: 'gems', rarity: 'epic', isLimited: false, isExclusive: false, category: 'furniture', tags: ['decoration', 'zen'], isActive: true,
  },
  {
    id: 'warm_lamp', name: 'Warm Lamp', description: 'A warm lamp to brighten the room',
    type: 'decoration', priceCoins: 300, currency: 'coins', rarity: 'common', isLimited: false, isExclusive: false, category: 'furniture', tags: ['decoration', 'lamp'], isActive: true,
  },
  {
    id: 'cat_tree', name: 'Deluxe Cat Tree', description: 'A tall tree for climbing and scratching',
    type: 'decoration', priceCoins: 2500, currency: 'coins', rarity: 'uncommon', isLimited: false, isExclusive: false, category: 'furniture', tags: ['decoration', 'toy'], isActive: true,
  },

  // Frames
  {
    id: 'golden_frame', name: 'Golden Frame', description: 'Premium golden frame for your pet',
    type: 'cosmetic', priceGems: 300, currency: 'gems', rarity: 'rare', isLimited: false, isExclusive: false, category: 'frames', tags: ['cosmetic', 'frame'], isActive: true,
  },
  {
    id: 'neon_frame', name: 'Neon Frame', description: 'Animated RGB glowing frame',
    type: 'cosmetic', priceGems: 450, currency: 'gems', rarity: 'epic', isLimited: false, isExclusive: false, category: 'frames', tags: ['cosmetic', 'frame', 'animated'], isActive: true,
  },

  // Packs
  {
    id: 'starter_pack', name: 'Starter Pack', description: 'Perfect for new players! Get 1000 coins and 50 gems',
    type: 'pack', priceGems: 0, currency: 'coins', rarity: 'common', isLimited: true, isExclusive: true, maxPurchase: 1, category: 'packs', tags: ['starter', 'pack'], isActive: true,
  },
]

// Starter Pack Configuration
const STARTER_PACKS: StarterPack[] = [
  {
    id: 'starter_pack_basic',
    name: 'New Player Starter Pack',
    description: 'Get a head start with coins, gems, and items!',
    price: 2.99,
    currency: 'usd',
    items: {
      coins: 1000,
      gems: 100,
      items: ['food_basket', 'toy_basic', 'deco_basic'],
    },
    isOneTime: true,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
]

interface EconomyStore {
  // State
  balance: CurrencyBalance
  userEconomy: UserEconomy | null
  battlePass: BattlePass | null
  gachaPools: GachaPool[]
  shopItems: ShopItem[]
  starterPacks: StarterPack[]
  isLoading: boolean
  error: string | null
  
  // Currency Operations
  addCoins: (amount: number) => Promise<void>
  addGems: (amount: number) => Promise<void>
  spendCoins: (amount: number) => Promise<void>
  spendGems: (amount: number) => Promise<void>
  
  // Daily Rewards
  claimDailyReward: () => Promise<DailyReward | null>
  getDailyReward: (day: number) => DailyReward | null
  
  // Battle Pass
  loadBattlePass: () => Promise<void>
  addBattlePassXP: (xp: number) => Promise<void>
  claimBattlePassReward: (level: number, isPremium: boolean) => Promise<Reward | null>
  purchaseBattlePassPremium: () => Promise<void>
  getBattlePassLevel: (level: number) => BattlePassLevel | null
  
  // Gacha
  pullGacha: (poolId: string, count: number) => Promise<GachaPull | null>
  getGachaPool: (poolId: string) => GachaPool | null
  
  // Shop
  purchaseShopItem: (itemId: string) => Promise<Purchase | null>
  getShopItem: (itemId: string) => ShopItem | null
  
  // Starter Pack
  purchaseStarterPack: (packId: string) => Promise<boolean>
  
  // Load Data
  loadUserEconomy: () => Promise<void>
  loadShopItems: () => void
  loadGachaPools: () => void
}

export const useEconomyStore = create<EconomyStore>((set, get) => ({
  // Initial State
  balance: { coins: 0, gems: 0 },
  userEconomy: null,
  battlePass: null,
  gachaPools: GACHA_POOLS,
  shopItems: SHOP_ITEMS,
  starterPacks: STARTER_PACKS,
  isLoading: false,
  error: null,
  
  // Currency Operations
  addCoins: async (amount: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    try {
      const { error } = await supabase.rpc('add_coins', {
        user_id: session.user.id,
        amount: amount,
      })
      
      if (error) throw error
      
      set((state) => ({
        balance: { ...state.balance, coins: state.balance.coins + amount },
      }))
    } catch (err) {
      console.error('[EconomyStore] Add coins error:', err)
      throw err
    }
  },
  
  addGems: async (amount: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    try {
      const { error } = await supabase.rpc('add_gems', {
        user_id: session.user.id,
        amount: amount,
      })
      
      if (error) throw error
      
      set((state) => ({
        balance: { ...state.balance, gems: state.balance.gems + amount },
      }))
    } catch (err) {
      console.error('[EconomyStore] Add gems error:', err)
      throw err
    }
  },
  
  spendCoins: async (amount: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    try {
      const { error } = await supabase.rpc('spend_coins', {
        user_id: session.user.id,
        amount: amount,
      })
      
      if (error) throw error
      
      set((state) => ({
        balance: { ...state.balance, coins: Math.max(0, state.balance.coins - amount) },
      }))
    } catch (err) {
      console.error('[EconomyStore] Spend coins error:', err)
      throw err
    }
  },
  
  spendGems: async (amount: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    try {
      const { error } = await supabase.rpc('spend_gems', {
        user_id: session.user.id,
        amount: amount,
      })
      
      if (error) throw error
      
      set((state) => ({
        balance: { ...state.balance, gems: Math.max(0, state.balance.gems - amount) },
      }))
    } catch (err) {
      console.error('[EconomyStore] Spend gems error:', err)
      throw err
    }
  },
  
  // Daily Rewards
  claimDailyReward: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    
    try {
      const { data, error } = await supabase.rpc('claim_daily_reward', {
        user_id: session.user.id,
      })
      
      if (error) throw error
      
      const reward = data as DailyReward
      
      // Update local balance
      set((state) => ({
        balance: {
          coins: state.balance.coins + reward.coins,
          gems: state.balance.gems + reward.gems,
        },
      }))
      
      return reward
    } catch (err) {
      console.error('[EconomyStore] Claim daily reward error:', err)
      throw err
    }
  },
  
  getDailyReward: (day: number) => {
    const reward = ECONOMY_CONFIG.dailyRewards.find(r => r.day === day)
    return reward || null
  },
  
  // Battle Pass
  loadBattlePass: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('battle_pass')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, which is ok
        throw error
      }
      
      set({ battlePass: data as BattlePass | null, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[EconomyStore] Load battle pass error:', message)
      set({ error: message, isLoading: false })
    }
  },
  
  addBattlePassXP: async (xp: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    try {
      const { error } = await supabase.rpc('add_battle_pass_xp', {
        user_id: session.user.id,
        xp: xp,
      })
      
      if (error) throw error
      
      // Reload battle pass to get updated state
      await get().loadBattlePass()
    } catch (err) {
      console.error('[EconomyStore] Add battle pass XP error:', err)
      throw err
    }
  },
  
  claimBattlePassReward: async (level: number, isPremium: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    
    try {
      const { data, error } = await supabase.rpc('claim_battle_pass_reward', {
        user_id: session.user.id,
        level: level,
        is_premium: isPremium,
      })
      
      if (error) throw error
      
      const reward = data as Reward
      
      // Reload battle pass to get updated state
      await get().loadBattlePass()
      
      return reward
    } catch (err) {
      console.error('[EconomyStore] Claim battle pass reward error:', err)
      throw err
    }
  },
  
  purchaseBattlePassPremium: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    try {
      const { error } = await supabase.rpc('purchase_battle_pass_premium', {
        user_id: session.user.id,
      })
      
      if (error) throw error
      
      // Reload battle pass to get updated state
      await get().loadBattlePass()
    } catch (err) {
      console.error('[EconomyStore] Purchase battle pass premium error:', err)
      throw err
    }
  },
  
  getBattlePassLevel: (level: number) => {
    return BATTLE_PASS_REWARDS.find(r => r.level === level) || null
  },
  
  // Gacha
  pullGacha: async (poolId: string, count: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    
    try {
      const pool = get().getGachaPool(poolId)
      if (!pool) throw new Error('Gacha pool not found')
      
      const cost = pool.currency === 'gems' ? pool.costGems * count : pool.costCoins * count
      
      // Spend currency
      if (pool.currency === 'gems') {
        await get().spendGems(cost)
      } else {
        await get().spendCoins(cost)
      }
      
      // Simulate gacha pull (in production, this would be server-side)
      const items: GachaItem[] = []
      for (let i = 0; i < count; i++) {
        const random = Math.random()
        let cumulative = 0
        for (const item of pool.items) {
          cumulative += item.probability
          if (random <= cumulative) {
            items.push(item)
            break
          }
        }
      }
      
      const pull: GachaPull = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        poolId,
        items,
        currency: pool.currency,
        cost,
        pityCounter: 0,
        isPity: false,
        createdAt: new Date().toISOString(),
      }
      
      return pull
    } catch (err) {
      console.error('[EconomyStore] Pull gacha error:', err)
      throw err
    }
  },
  
  getGachaPool: (poolId: string) => {
    return get().gachaPools.find(p => p.id === poolId) || null
  },
  
  // Shop
  purchaseShopItem: async (itemId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    
    try {
      const item = get().getShopItem(itemId)
      if (!item) throw new Error('Shop item not found')
      
      const currency = item.currency === 'gems' ? 'gems' : 'coins'
      const amount = item.currency === 'gems' ? item.priceGems! : item.priceCoins!
      
      // Spend currency
      if (currency === 'gems') {
        await get().spendGems(amount)
      } else {
        await get().spendCoins(amount)
      }
      
      const purchase: Purchase = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        itemId,
        itemType: item.type,
        currency,
        amount,
        createdAt: new Date().toISOString(),
      }
      
      return purchase
    } catch (err) {
      console.error('[EconomyStore] Purchase shop item error:', err)
      throw err
    }
  },
  
  getShopItem: (itemId: string) => {
    return get().shopItems.find(i => i.id === itemId) || null
  },
  
  // Starter Pack
  purchaseStarterPack: async (packId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return false
    
    try {
      const pack = STARTER_PACKS.find(p => p.id === packId)
      if (!pack) throw new Error('Starter pack not found')
      
      // In production, this would integrate with Stripe/Apple Pay/Google Pay
      // For now, we'll just simulate the purchase
      console.log('[EconomyStore] Purchasing starter pack:', packId, 'Price:', pack.price)
      
      // Add items to user's inventory
      if (pack.items.coins) await get().addCoins(pack.items.coins)
      if (pack.items.gems) await get().addGems(pack.items.gems)
      
      return true
    } catch (err) {
      console.error('[EconomyStore] Purchase starter pack error:', err)
      throw err
    }
  },
  
  // Load Data
  loadUserEconomy: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('coins, gems')
        .eq('id', session.user.id)
        .single()
      
      if (error) throw error
      
      set({
        balance: {
          coins: data.coins || 0,
          gems: data.gems || 0,
        },
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[EconomyStore] Load user economy error:', message)
      set({ error: message, isLoading: false })
    }
  },
  
  loadShopItems: () => {
    set({ shopItems: SHOP_ITEMS })
  },
  
  loadGachaPools: () => {
    set({ gachaPools: GACHA_POOLS })
  },
}))