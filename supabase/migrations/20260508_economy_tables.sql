-- Economy & Monetization Tables Migration
-- Created: May 8, 2026

-- === BATTLE PASS TABLE ===
CREATE TABLE IF NOT EXISTS battle_pass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Premium status
  is_premium BOOLEAN DEFAULT FALSE,
  premium_purchased_at TIMESTAMPTZ,
  
  -- Progress
  current_level INT DEFAULT 0,
  current_xp BIGINT DEFAULT 0,
  total_xp BIGINT DEFAULT 0,
  
  -- Season tracking
  season_id TEXT NOT NULL DEFAULT 'season_1',
  season_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  season_end TIMESTAMPTZ NOT NULL,
  
  -- Claimed rewards
  claimed_free_levels INT[] DEFAULT '{}',
  claimed_premium_levels INT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_season UNIQUE (user_id, season_id)
);

-- Indexes for battle_pass
CREATE INDEX idx_battle_pass_user_id ON battle_pass(user_id);
CREATE INDEX idx_battle_pass_season ON battle_pass(season_id);
CREATE INDEX idx_battle_pass_level ON battle_pass(current_level DESC);

-- === GACHA PULLS TABLE ===
CREATE TABLE IF NOT EXISTS gacha_pulls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Pool info
  pool_id TEXT NOT NULL,
  pool_name TEXT NOT NULL,
  
  -- Pull results
  items JSONB NOT NULL, -- Array of pulled items with rarity
  item_ids TEXT[] NOT NULL, -- Array of item IDs pulled
  
  -- Cost
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'gems')),
  cost BIGINT NOT NULL,
  
  -- Pity system
  pity_counter INT DEFAULT 0,
  is_pity BOOLEAN DEFAULT FALSE,
  pity_item_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for gacha_pulls
CREATE INDEX idx_gacha_pulls_user_id ON gacha_pulls(user_id);
CREATE INDEX idx_gacha_pulls_pool_id ON gacha_pulls(pool_id);
CREATE INDEX idx_gacha_pulls_created_at ON gacha_pulls(created_at DESC);

-- === PURCHASES TABLE ===
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Item info
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  
  -- Cost
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'gems')),
  amount BIGINT NOT NULL,
  
  -- Payment method (for real money purchases)
  payment_method TEXT, -- 'stripe', 'apple_pay', 'google_pay', etc.
  payment_id TEXT, -- External payment ID
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for purchases
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_item_id ON purchases(item_id);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- === USER ECONOMY TABLE ===
CREATE TABLE IF NOT EXISTS user_economy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Current balance
  coins BIGINT DEFAULT 0 NOT NULL,
  gems BIGINT DEFAULT 0 NOT NULL,
  
  -- Lifetime stats
  total_coins_earned BIGINT DEFAULT 0,
  total_gems_earned BIGINT DEFAULT 0,
  total_coins_spent BIGINT DEFAULT 0,
  total_gems_spent BIGINT DEFAULT 0,
  
  -- Daily rewards
  last_daily_claim TIMESTAMPTZ,
  daily_streak INT DEFAULT 0,
  
  -- Gacha pity counters (pool_id -> counter)
  gacha_pity_counters JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_economy
CREATE INDEX idx_user_economy_user_id ON user_economy(user_id);
CREATE INDEX idx_user_economy_coins ON user_economy(coins DESC);
CREATE INDEX idx_user_economy_gems ON user_economy(gems DESC);

-- === INVENTORY TABLE ===
-- Note: inventory table already exists in 001_initial_schema.sql
-- We'll add new columns to it

-- Add new columns to existing inventory table
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS item_name TEXT,
  ADD COLUMN IF NOT EXISTS item_type TEXT CHECK (item_type IN ('food', 'toy', 'decoration', 'medicine', 'accessory', 'cosmetic', 'pet', 'egg')),
  ADD COLUMN IF NOT EXISTS item_rarity TEXT CHECK (item_rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  ADD COLUMN IF NOT EXISTS is_equipped BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS acquired_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop old unique constraint and add new one
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_user_id_item_id_key;
ALTER TABLE inventory ADD CONSTRAINT unique_user_item UNIQUE (user_id, item_id, is_equipped);

-- Create indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_item_type ON inventory(item_type);
CREATE INDEX IF NOT EXISTS idx_inventory_item_rarity ON inventory(item_rarity);
CREATE INDEX IF NOT EXISTS idx_inventory_is_equipped ON inventory(is_equipped);
CREATE INDEX IF NOT EXISTS idx_inventory_acquired_at ON inventory(acquired_at DESC);

-- === TRIGGERS FOR UPDATED_AT ===

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_battle_pass_updated_at BEFORE UPDATE ON battle_pass
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_economy_updated_at BEFORE UPDATE ON user_economy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- === ROW LEVEL SECURITY (RLS) ===

-- Enable RLS on all tables
ALTER TABLE battle_pass ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_pulls ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- battle_pass: Users can only see their own battle pass
CREATE POLICY "Users can view own battle pass" ON battle_pass
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own battle pass" ON battle_pass
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own battle pass" ON battle_pass
    FOR UPDATE USING (auth.uid() = user_id);

-- gacha_pulls: Users can only see their own pulls
CREATE POLICY "Users can view own gacha pulls" ON gacha_pulls
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gacha pulls" ON gacha_pulls
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- purchases: Users can only see their own purchases
CREATE POLICY "Users can view own purchases" ON purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_economy: Users can only see their own economy
CREATE POLICY "Users can view own economy" ON user_economy
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own economy" ON user_economy
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own economy" ON user_economy
    FOR UPDATE USING (auth.uid() = user_id);

-- inventory: Users can only see their own inventory
-- Drop existing policies first (from 001_initial_schema.sql)
DROP POLICY IF EXISTS "Users can CRUD own inventory" ON inventory;

-- Create new policies
CREATE POLICY "Users can view own inventory" ON inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON inventory
    FOR DELETE USING (auth.uid() = user_id);

-- === COMMENTS FOR DOCUMENTATION ===

COMMENT ON TABLE battle_pass IS 'Battle pass progress tracking with free and premium tracks';
COMMENT ON TABLE gacha_pulls IS 'Gacha pull history with pity system tracking';
COMMENT ON TABLE purchases IS 'Purchase transaction history';
COMMENT ON TABLE user_economy IS 'User economy balance and statistics';
COMMENT ON TABLE inventory IS 'User inventory of items and pets';