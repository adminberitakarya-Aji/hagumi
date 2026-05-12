// Shared types for web and mobile
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  stage: 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder' | 'dead';
  is_alive: boolean;
  stats: {
    hunger: number;
    mood: number;
    energy: number;
    health: number;
    growth: number;
    warmth: number;
  };
  genetics: {
    color: {
      primary: string;
      secondary: string;
      pattern: string;
    };
    personality: string;
    metabolism: {
      baseHungerRate: number;
      baseEnergyRate: number;
      baseMoodRate: number;
      growthFactor: number;
      lifespanModifier: number;
    };
  };
  day_age: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  coins: number;
  gems: number;
  level: number;
  xp: number;
}

export interface MarketListing {
  id: string;
  seller_id: string;
  item_type: string;
  item_id: string;
  price_coins: number;
  price_gems: number;
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  minDifficulty: number;
  maxDifficulty: number;
  rewardTable: {
    minScore: number;
    maxScore: number;
    rewards: { type: string; amount: number; probability: number }[];
  }[];
  statChanges: Partial<Pet['stats']>;
  energyCost: number;
  cooldownMinutes: number;
}

export interface BattlePassLevel {
  level: number;
  xpRequired: number;
  freeReward?: {
    type: 'coins' | 'gems' | 'item';
    amount: number;
    itemId?: string;
  };
  premiumReward?: {
    type: 'coins' | 'gems' | 'item';
    amount: number;
    itemId?: string;
  };
}