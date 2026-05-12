import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PetLine, Item, Achievement, PetLineId, ItemRarity } from './types'

// ─── Pet Lines ───────────────────────────────────────

const PET_LINES: Record<PetLineId, PetLine> = {
  mochi: {
    id: 'mochi',
    name: 'Mochi Line',
    element: 'light',
    forms: ['Mochi', 'Mochiko', 'Daifuku'],
    colors: { primary: '#ffb7c5', secondary: '#ff69b4', pattern: 'solid' },
    personality: 'Affectionate',
    description: 'Sweet and loving pets that thrive on attention.',
    isUnlocked: true,
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha Line',
    element: 'nature',
    forms: ['Matcha', 'Sencha', 'Gyokuro'],
    colors: { primary: '#8fbc8f', secondary: '#556b2f', pattern: 'gradient' },
    personality: 'Calm',
    description: 'Peaceful pets that bring tranquility to your home.',
    isUnlocked: true,
  },
  yuzu: {
    id: 'yuzu',
    name: 'Yuzu Line',
    element: 'energy',
    forms: ['Yuzu', 'Citrona', 'Zestia'],
    colors: { primary: '#ffd700', secondary: '#ff8c00', pattern: 'striped' },
    personality: 'Energetic',
    description: 'Vibrant pets full of boundless energy and joy.',
    isUnlocked: true,
  },
  kuro: {
    id: 'kuro',
    name: 'Kuro Line',
    element: 'shadow',
    forms: ['Kuro', 'Yami', 'Kage'],
    colors: { primary: '#2c3e50', secondary: '#1a1a2e', pattern: 'solid' },
    personality: 'Mysterious',
    description: 'Enigmatic pets with a quiet, observant nature.',
    isUnlocked: true,
  },
  mizu: {
    id: 'mizu',
    name: 'Mizu Line',
    element: 'water',
    forms: ['Mizu', 'Mizuki', 'Kaijin'],
    colors: { primary: '#87ceeb', secondary: '#4682b4', pattern: 'wave' },
    personality: 'Gentle',
    description: 'Graceful pets that flow like water.',
    isUnlocked: false,
  },
  honoo: {
    id: 'honoo',
    name: 'Honoo Line',
    element: 'fire',
    forms: ['Honoo', 'Kaen', 'Enma'],
    colors: { primary: '#ff4500', secondary: '#dc143c', pattern: 'flame' },
    personality: 'Passionate',
    description: 'Fiery pets with burning determination.',
    isUnlocked: false,
  },
  kaze: {
    id: 'kaze',
    name: 'Kaze Line',
    element: 'wind',
    forms: ['Kaze', 'Fuujin', 'Arashi'],
    colors: { primary: '#e0ffff', secondary: '#b0e0e6', pattern: 'swirl' },
    personality: 'Free-spirited',
    description: 'Adventurous pets that love to explore.',
    isUnlocked: false,
  },
  tsuchi: {
    id: 'tsuchi',
    name: 'Tsuchi Line',
    element: 'earth',
    forms: ['Tsuchi', 'Daichi', 'Ishibumi'],
    colors: { primary: '#8b4513', secondary: '#a0522d', pattern: 'speckled' },
    personality: 'Steadfast',
    description: 'Reliable pets that are always there for you.',
    isUnlocked: false,
  },
}

// ─── Items Catalog ────────────────────────────────────

const ITEMS: Item[] = [
  // Food
  { id: 'food-basic', name: 'Basic Kibble', type: 'food', rarity: 'common', description: 'Simple but filling.', icon: '🍖', price: { coins: 10 }, statChanges: { hunger: 15 }, isConsumable: true, isEquippable: false },
  { id: 'food-fish', name: 'Fresh Fish', type: 'food', rarity: 'uncommon', description: 'A tasty treat from the sea.', icon: '🐟', price: { coins: 25 }, statChanges: { hunger: 25, mood: 5 }, isConsumable: true, isEquippable: false },
  { id: 'food-sushi', name: 'Sushi Platter', type: 'food', rarity: 'rare', description: 'Delicious sushi assortment.', icon: '🍣', price: { coins: 50 }, statChanges: { hunger: 40, mood: 10 }, isConsumable: true, isEquippable: false },
  { id: 'food-ramen', name: 'Delicious Ramen', type: 'rare-food', rarity: 'epic', description: 'Warm and comforting ramen.', icon: '🍜', price: { coins: 100 }, statChanges: { hunger: 50, mood: 15, energy: 10 }, isConsumable: true, isEquippable: false },
  { id: 'food-bento', name: 'Premium Bento', type: 'rare-food', rarity: 'legendary', description: 'A beautifully crafted bento box.', icon: '🍱', price: { gems: 5 }, statChanges: { hunger: 60, mood: 20, energy: 15 }, isConsumable: true, isEquippable: false },
  
  // Toys
  { id: 'toy-ball', name: 'Bouncy Ball', type: 'toy', rarity: 'common', description: 'A simple ball for endless fun.', icon: '⚽', price: { coins: 15 }, statChanges: { mood: 10, energy: -5 }, isConsumable: false, isEquippable: false },
  { id: 'toy-yarn', name: 'Yarn Ball', type: 'toy', rarity: 'uncommon', description: 'Soft and perfect for batting around.', icon: '🧶', price: { coins: 30 }, statChanges: { mood: 15, energy: -8 }, isConsumable: false, isEquippable: false },
  { id: 'toy-frisbee', name: 'Flying Disc', type: 'toy', rarity: 'rare', description: 'Great for outdoor play sessions.', icon: '🥏', price: { coins: 60 }, statChanges: { mood: 20, energy: -10 }, isConsumable: false, isEquippable: false },
  { id: 'toy-puzzle', name: 'Puzzle Toy', type: 'toy', rarity: 'epic', description: 'Challenging and rewarding.', icon: '🧩', price: { coins: 120 }, statChanges: { mood: 25, energy: -12 }, isConsumable: false, isEquippable: false },
  
  // Decorations
  { id: 'deco-bed', name: 'Cozy Bed', type: 'decoration', rarity: 'common', description: 'A comfortable place to rest.', icon: '🛏️', price: { coins: 50 }, statChanges: { energy: 10 }, isConsumable: false, isEquippable: true },
  { id: 'deco-lamp', name: 'Warm Lamp', type: 'decoration', rarity: 'uncommon', description: 'Soft lighting for peaceful nights.', icon: '💡', price: { coins: 80 }, statChanges: { mood: 5, energy: 5 }, isConsumable: false, isEquippable: true },
  { id: 'deco-fountain', name: 'Mini Fountain', type: 'decoration', rarity: 'rare', description: 'Soothing water sounds.', icon: '⛲', price: { coins: 200 }, statChanges: { mood: 10, energy: 10 }, isConsumable: false, isEquippable: true },
  { id: 'deco-sakura', name: 'Sakura Tree', type: 'decoration', rarity: 'epic', description: 'Beautiful cherry blossom tree.', icon: '🌸', price: { gems: 10 }, statChanges: { mood: 15 }, isConsumable: false, isEquippable: true },
  
  // Medicine
  { id: 'med-bandage', name: 'Bandage', type: 'medicine', rarity: 'common', description: 'Basic first aid.', icon: '🩹', price: { coins: 20 }, statChanges: { health: 10 }, isConsumable: true, isEquippable: false },
  { id: 'med-ointment', name: 'Healing Ointment', type: 'medicine', rarity: 'uncommon', description: 'Soothes minor injuries.', icon: '💊', price: { coins: 40 }, statChanges: { health: 20 }, isConsumable: true, isEquippable: false },
  { id: 'med-elixir', name: 'Health Elixir', type: 'medicine', rarity: 'rare', description: 'Powerful healing potion.', icon: '🧪', price: { coins: 100 }, statChanges: { health: 40 }, isConsumable: true, isEquippable: false },
  { id: 'med-revive', name: 'Bloom of Life', type: 'medicine', rarity: 'legendary', description: 'Revive a fallen pet.', icon: '🌺', price: { gems: 20 }, statChanges: { health: 100 }, isConsumable: true, isEquippable: false },
  
  // Accessories
  { id: 'acc-ribbon', name: 'Cute Ribbon', type: 'accessory', rarity: 'common', description: 'A simple ribbon for style.', icon: '🎀', price: { coins: 30 }, isConsumable: false, isEquippable: true },
  { id: 'acc-collar', name: 'Fancy Collar', type: 'accessory', rarity: 'uncommon', description: 'Elegant collar with a bell.', icon: '🔔', price: { coins: 60 }, isConsumable: false, isEquippable: true },
  { id: 'acc-crown', name: 'Mini Crown', type: 'rare-accessory', rarity: 'rare', description: 'Fit for royalty.', icon: '👑', price: { coins: 150 }, isConsumable: false, isEquippable: true },
  { id: 'acc-halo', name: 'Angel Halo', type: 'rare-accessory', rarity: 'epic', description: 'Divine accessory.', icon: '😇', price: { gems: 15 }, isConsumable: false, isEquippable: true },
  { id: 'acc-wings', name: 'Fairy Wings', type: 'rare-accessory', rarity: 'legendary', description: 'Magical wings for your pet.', icon: '🧚', price: { gems: 30 }, isConsumable: false, isEquippable: true },
  
  // Cosmetics
  { id: 'cos-dye-pink', name: 'Pink Dye', type: 'cosmetic', rarity: 'uncommon', description: 'Change pet color to pink.', icon: '🎨', price: { coins: 100 }, isConsumable: true, isEquippable: false },
  { id: 'cos-dye-blue', name: 'Blue Dye', type: 'cosmetic', rarity: 'uncommon', description: 'Change pet color to blue.', icon: '🎨', price: { coins: 100 }, isConsumable: true, isEquippable: false },
  { id: 'cos-dye-gold', name: 'Golden Dye', type: 'cosmetic', rarity: 'rare', description: 'Change pet color to gold.', icon: '✨', price: { gems: 5 }, isConsumable: true, isEquippable: false },
]

// ─── Achievements ────────────────────────────────────

const ACHIEVEMENTS: Achievement[] = [
  // Pet Achievements
  { id: 'pet-first-hatch', name: 'First Hatch', description: 'Hatch your first pet.', icon: '🥚', category: 'pet', requirement: { type: 'count', target: 1, field: 'pets_hatched' }, reward: { coins: 100, gems: 1 }, isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'pet-10-hatches', name: 'Pet Collector', description: 'Hatch 10 pets.', icon: '🐾', category: 'pet', requirement: { type: 'count', target: 10, field: 'pets_hatched' }, reward: { coins: 500, gems: 5 }, isUnlocked: false, progress: 0, maxProgress: 10 },
  { id: 'pet-100-hatches', name: 'Master Breeder', description: 'Hatch 100 pets.', icon: '🏆', category: 'pet', requirement: { type: 'count', target: 100, field: 'pets_hatched' }, reward: { coins: 5000, gems: 50, title: 'Master Breeder' }, isUnlocked: false, progress: 0, maxProgress: 100 },
  { id: 'pet-first-evolution', name: 'Growing Up', description: 'Evolve your first pet.', icon: '⭐', category: 'pet', requirement: { type: 'count', target: 1, field: 'evolutions' }, reward: { coins: 200, gems: 2 }, isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'pet-max-stats', name: 'Perfect Care', description: 'Reach 100 in all stats.', icon: '💯', category: 'pet', requirement: { type: 'stat', target: 100, field: 'all_stats' }, reward: { coins: 1000, gems: 10 }, isUnlocked: false, progress: 0, maxProgress: 100 },
  
  // Social Achievements
  { id: 'social-first-friend', name: 'Making Friends', description: 'Add your first friend.', icon: '👋', category: 'social', requirement: { type: 'count', target: 1, field: 'friends_added' }, reward: { coins: 50 }, isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'social-10-friends', name: 'Social Butterfly', description: 'Have 10 friends.', icon: '🦋', category: 'social', requirement: { type: 'count', target: 10, field: 'friends_added' }, reward: { coins: 300, gems: 3 }, isUnlocked: false, progress: 0, maxProgress: 10 },
  { id: 'social-50-visits', name: 'Popular Host', description: 'Receive 50 visits.', icon: '🏠', category: 'social', requirement: { type: 'count', target: 50, field: 'visits_received' }, reward: { coins: 500, gems: 5 }, isUnlocked: false, progress: 0, maxProgress: 50 },
  { id: 'social-100-gifts', name: 'Generous Giver', description: 'Send 100 gifts.', icon: '🎁', category: 'social', requirement: { type: 'count', target: 100, field: 'gifts_sent' }, reward: { coins: 1000, gems: 10 }, isUnlocked: false, progress: 0, maxProgress: 100 },
  
  // Economy Achievements
  { id: 'econ-first-1000', name: 'First Thousand', description: 'Earn 1,000 coins.', icon: '💰', category: 'economy', requirement: { type: 'count', target: 1000, field: 'coins_earned' }, reward: { gems: 1 }, isUnlocked: false, progress: 0, maxProgress: 1000 },
  { id: 'econ-10k-coins', name: 'Coin Master', description: 'Earn 10,000 coins.', icon: '💎', category: 'economy', requirement: { type: 'count', target: 10000, field: 'coins_earned' }, reward: { gems: 10 }, isUnlocked: false, progress: 0, maxProgress: 10000 },
  { id: 'econ-first-gem', name: 'Gem Collector', description: 'Earn your first gem.', icon: '💠', category: 'economy', requirement: { type: 'count', target: 1, field: 'gems_earned' }, reward: { coins: 100 }, isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'econ-100-gems', name: 'Gem Hoarder', description: 'Earn 100 gems.', icon: '🌟', category: 'economy', requirement: { type: 'count', target: 100, field: 'gems_earned' }, reward: { coins: 5000, gems: 20 }, isUnlocked: false, progress: 0, maxProgress: 100 },
  
  // Mini-Game Achievements
  { id: 'game-first-play', name: 'First Game', description: 'Play your first mini-game.', icon: '🎮', category: 'minigame', requirement: { type: 'count', target: 1, field: 'games_played' }, reward: { coins: 50 }, isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'game-100-plays', name: 'Game Enthusiast', description: 'Play 100 mini-games.', icon: '🕹️', category: 'minigame', requirement: { type: 'count', target: 100, field: 'games_played' }, reward: { coins: 1000, gems: 10 }, isUnlocked: false, progress: 0, maxProgress: 100 },
  { id: 'game-perfect-score', name: 'Perfect Score', description: 'Get a perfect score in any game.', icon: '🎯', category: 'minigame', requirement: { type: 'score', target: 1000, field: 'high_score' }, reward: { coins: 500, gems: 5 }, isUnlocked: false, progress: 0, maxProgress: 1000 },
  { id: 'game-all-games', name: 'Jack of All Games', description: 'Play all 5 mini-games.', icon: '🎪', category: 'minigame', requirement: { type: 'count', target: 5, field: 'unique_games_played' }, reward: { coins: 300, gems: 3 }, isUnlocked: false, progress: 0, maxProgress: 5 },
  
  // Exploration Achievements
  { id: 'explore-first-day', name: 'First Day', description: 'Survive your first day.', icon: '📅', category: 'exploration', requirement: { type: 'time', target: 1, field: 'days_survived' }, reward: { coins: 100 }, isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'explore-7-days', name: 'Week Survivor', description: 'Survive 7 days.', icon: '📆', category: 'exploration', requirement: { type: 'time', target: 7, field: 'days_survived' }, reward: { coins: 500, gems: 5 }, isUnlocked: false, progress: 0, maxProgress: 7 },
  { id: 'explore-30-days', name: 'Month Survivor', description: 'Survive 30 days.', icon: '🗓️', category: 'exploration', requirement: { type: 'time', target: 30, field: 'days_survived' }, reward: { coins: 2000, gems: 20 }, isUnlocked: false, progress: 0, maxProgress: 30 },
  { id: 'explore-100-days', name: 'Centenarian', description: 'Survive 100 days.', icon: '🎖️', category: 'exploration', requirement: { type: 'time', target: 100, field: 'days_survived' }, reward: { coins: 10000, gems: 100, title: 'Centenarian' }, isUnlocked: false, progress: 0, maxProgress: 100 },
]

// ─── Store ───────────────────────────────────────────

interface ContentStore {
  // Data
  petLines: Record<PetLineId, PetLine>
  items: Item[]
  achievements: Achievement[]
  
  // Inventory
  inventory: Record<string, number>  // itemId → quantity
  unlockedPetLines: PetLineId[]
  unlockedAchievements: string[]
  
  // Stats tracking
  stats: {
    pets_hatched: number
    evolutions: number
    friends_added: number
    visits_received: number
    gifts_sent: number
    coins_earned: number
    gems_earned: number
    games_played: number
    unique_games_played: number
    days_survived: number
  }
  
  // Actions
  getPetLine: (id: PetLineId) => PetLine | undefined
  getItem: (id: string) => Item | undefined
  getAchievement: (id: string) => Achievement | undefined
  getItemsByType: (type: string) => Item[]
  getItemsByRarity: (rarity: ItemRarity) => Item[]
  
  unlockPetLine: (id: PetLineId) => void
  unlockAchievement: (id: string) => void
  updateProgress: (field: string, value: number) => void
  checkAchievements: () => void
  
  addItem: (itemId: string, quantity: number) => void
  removeItem: (itemId: string, quantity: number) => void
  hasItem: (itemId: string) => boolean
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      petLines: PET_LINES,
      items: ITEMS,
      achievements: ACHIEVEMENTS,
      inventory: {},
      unlockedPetLines: ['mochi', 'matcha', 'yuzu', 'kuro'],
      unlockedAchievements: [],
      stats: {
        pets_hatched: 0,
        evolutions: 0,
        friends_added: 0,
        visits_received: 0,
        gifts_sent: 0,
        coins_earned: 0,
        gems_earned: 0,
        games_played: 0,
        unique_games_played: 0,
        days_survived: 0,
      },

      getPetLine: (id) => get().petLines[id],
      getItem: (id) => get().items.find((i) => i.id === id),
      getAchievement: (id) => get().achievements.find((a) => a.id === id),
      getItemsByType: (type) => get().items.filter((i) => i.type === type),
      getItemsByRarity: (rarity) => get().items.filter((i) => i.rarity === rarity),

      unlockPetLine: (id) => {
        set((prev) => ({
          unlockedPetLines: prev.unlockedPetLines.includes(id) ? prev.unlockedPetLines : [...prev.unlockedPetLines, id],
          petLines: {
            ...prev.petLines,
            [id]: { ...prev.petLines[id], isUnlocked: true },
          },
        }))
      },

      unlockAchievement: (id) => {
        const achievement = get().getAchievement(id)
        if (!achievement || get().unlockedAchievements.includes(id)) return

        set((prev) => ({
          unlockedAchievements: [...prev.unlockedAchievements, id],
          achievements: prev.achievements.map((a) => (a.id === id ? { ...a, isUnlocked: true } : a)),
        }))
      },

      updateProgress: (field, value) => {
        set((prev) => ({
          stats: { ...prev.stats, [field]: (prev.stats as any)[field] + value },
        }))
        get().checkAchievements()
      },

      checkAchievements: () => {
        const { stats, achievements, unlockedAchievements } = get()
        
        achievements.forEach((achievement) => {
          if (unlockedAchievements.includes(achievement.id)) return

          let progress = 0
          const target = achievement.requirement.target

          switch (achievement.requirement.type) {
            case 'count':
              progress = (stats as any)[achievement.requirement.field || ''] || 0
              break
            case 'time':
              progress = (stats as any)[achievement.requirement.field || ''] || 0
              break
            case 'stat':
              progress = (stats as any)[achievement.requirement.field || ''] || 0
              break
            case 'score':
              progress = (stats as any)[achievement.requirement.field || ''] || 0
              break
          }

          if (progress >= target) {
            get().unlockAchievement(achievement.id)
          }
        })
      },

      addItem: (itemId, quantity) => {
        set((prev) => ({
          inventory: {
            ...prev.inventory,
            [itemId]: (prev.inventory[itemId] || 0) + quantity,
          },
        }))
      },

      removeItem: (itemId, quantity) => {
        set((prev) => {
          const current = prev.inventory[itemId] || 0
          if (current < quantity) return prev
          const newQuantity = current - quantity
          const newInventory = { ...prev.inventory }
          if (newQuantity === 0) {
            delete newInventory[itemId]
          } else {
            newInventory[itemId] = newQuantity
          }
          return { inventory: newInventory }
        })
      },

      hasItem: (itemId) => (get().inventory[itemId] || 0) > 0,
    }),
    { name: 'hagumi-content-storage' }
  )
)