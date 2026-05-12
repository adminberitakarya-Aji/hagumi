# Backend Integration Guide for Economy System

## Overview
This guide explains how to integrate the economy backend with the frontend application using Supabase.

## Prerequisites
- Supabase project created
- Database migrations applied
- RPC functions deployed

## Database Schema

### Tables Created

#### 1. `battle_pass`
Tracks user battle pass progress with free and premium tracks.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `is_premium` (BOOLEAN)
- `premium_purchased_at` (TIMESTAMPTZ)
- `current_level` (INT)
- `current_xp` (BIGINT)
- `total_xp` (BIGINT)
- `season_id` (TEXT)
- `season_start` (TIMESTAMPTZ)
- `season_end` (TIMESTAMPTZ)
- `claimed_free_levels` (INT[])
- `claimed_premium_levels` (INT[])
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_battle_pass_user_id` on `user_id`
- `idx_battle_pass_season` on `season_id`
- `idx_battle_pass_level` on `current_level DESC`

#### 2. `gacha_pulls`
Records all gacha pulls with pity system tracking.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `pool_id` (TEXT)
- `pool_name` (TEXT)
- `items` (JSONB) - Array of pulled items
- `item_ids` (TEXT[]) - Array of item IDs
- `currency` (TEXT) - 'coins' or 'gems'
- `cost` (BIGINT)
- `pity_counter` (INT)
- `is_pity` (BOOLEAN)
- `pity_item_id` (TEXT)
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_gacha_pulls_user_id` on `user_id`
- `idx_gacha_pulls_pool_id` on `pool_id`
- `idx_gacha_pulls_created_at` on `created_at DESC`

#### 3. `purchases`
Records all purchase transactions.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `item_id` (TEXT)
- `item_type` (TEXT)
- `item_name` (TEXT)
- `currency` (TEXT) - 'coins' or 'gems'
- `amount` (BIGINT)
- `payment_method` (TEXT) - 'stripe', 'apple_pay', etc.
- `payment_id` (TEXT) - External payment ID
- `payment_status` (TEXT) - 'pending', 'completed', 'failed', 'refunded'
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_purchases_user_id` on `user_id`
- `idx_purchases_item_id` on `item_id`
- `idx_purchases_created_at` on `created_at DESC`

#### 4. `user_economy`
Tracks user economy balance and statistics.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users, UNIQUE)
- `coins` (BIGINT)
- `gems` (BIGINT)
- `total_coins_earned` (BIGINT)
- `total_gems_earned` (BIGINT)
- `total_coins_spent` (BIGINT)
- `total_gems_spent` (BIGINT)
- `last_daily_claim` (TIMESTAMPTZ)
- `daily_streak` (INT)
- `gacha_pity_counters` (JSONB) - Pool ID to counter mapping
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_user_economy_user_id` on `user_id`
- `idx_user_economy_coins` on `coins DESC`
- `idx_user_economy_gems` on `gems DESC`

#### 5. `inventory`
Tracks user inventory of items and pets.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `item_id` (TEXT)
- `item_type` (TEXT) - 'food', 'toy', 'decoration', 'medicine', 'accessory', 'cosmetic', 'pet', 'egg'
- `item_name` (TEXT)
- `item_rarity` (TEXT) - 'common', 'uncommon', 'rare', 'epic', 'legendary'
- `quantity` (INT)
- `is_equipped` (BOOLEAN)
- `metadata` (JSONB) - Additional item-specific data
- `acquired_at` (TIMESTAMPTZ)
- `expires_at` (TIMESTAMPTZ) - For perishable items

**Indexes:**
- `idx_inventory_user_id` on `user_id`
- `idx_inventory_item_id` on `item_id`
- `idx_inventory_item_type` on `item_type`
- `idx_inventory_is_equipped` on `is_equipped`

## RPC Functions

### Currency Operations

#### `add_coins(user_id UUID, amount BIGINT)`
Adds coins to user's balance.

**Parameters:**
- `user_id`: User's UUID
- `amount`: Amount of coins to add (must be positive)

**Returns:** VOID

**Example:**
```typescript
const { error } = await supabase.rpc('add_coins', {
  user_id: userId,
  amount: 100
})
```

#### `add_gems(user_id UUID, amount BIGINT)`
Adds gems to user's balance.

**Parameters:**
- `user_id`: User's UUID
- `amount`: Amount of gems to add (must be positive)

**Returns:** VOID

**Example:**
```typescript
const { error } = await supabase.rpc('add_gems', {
  user_id: userId,
  amount: 50
})
```

#### `spend_coins(user_id UUID, amount BIGINT)`
Spends coins from user's balance.

**Parameters:**
- `user_id`: User's UUID
- `amount`: Amount of coins to spend (must be positive)

**Returns:** VOID

**Throws:**
- 'User economy not found' if user doesn't exist
- 'Insufficient coins' if balance is too low

**Example:**
```typescript
const { error } = await supabase.rpc('spend_coins', {
  user_id: userId,
  amount: 50
})
```

#### `spend_gems(user_id UUID, amount BIGINT)`
Spends gems from user's balance.

**Parameters:**
- `user_id`: User's UUID
- `amount`: Amount of gems to spend (must be positive)

**Returns:** VOID

**Throws:**
- 'User economy not found' if user doesn't exist
- 'Insufficient gems' if balance is too low

**Example:**
```typescript
const { error } = await supabase.rpc('spend_gems', {
  user_id: userId,
  amount: 100
})
```

### Daily Rewards

#### `claim_daily_reward(user_id UUID)`
Claims daily reward for the user.

**Parameters:**
- `user_id`: User's UUID

**Returns:** JSONB with reward details

**Response Structure:**
```json
{
  "day": 1,
  "coins": 50,
  "gems": 0,
  "bonus": null,
  "streak": 1
}
```

**Throws:**
- 'Daily reward already claimed today' if already claimed

**Example:**
```typescript
const { data, error } = await supabase.rpc('claim_daily_reward', {
  user_id: userId
})

if (data) {
  console.log(`Day ${data.day}: ${data.coins} coins, ${data.gems} gems`)
}
```

### Battle Pass

#### `add_battle_pass_xp(user_id UUID, xp BIGINT)`
Adds XP to user's battle pass.

**Parameters:**
- `user_id`: User's UUID
- `xp`: Amount of XP to add (must be positive)

**Returns:** VOID

**Behavior:**
- Creates battle pass if doesn't exist
- Updates level based on total XP (100 XP per level)
- Tracks current season

**Example:**
```typescript
const { error } = await supabase.rpc('add_battle_pass_xp', {
  user_id: userId,
  xp: 250
})
```

#### `claim_battle_pass_reward(user_id UUID, level INT, is_premium BOOLEAN)`
Claims a battle pass reward.

**Parameters:**
- `user_id`: User's UUID
- `level`: Level to claim
- `is_premium`: Whether claiming premium reward

**Returns:** JSONB with reward details

**Throws:**
- 'Battle pass not found' if no battle pass exists
- 'Level not unlocked yet' if level > current level
- 'Premium battle pass required' if is_premium=true but not premium
- 'Reward already claimed' if already claimed

**Example:**
```typescript
const { data, error } = await supabase.rpc('claim_battle_pass_reward', {
  user_id: userId,
  level: 10,
  is_premium: false
})
```

#### `purchase_battle_pass_premium(user_id UUID)`
Upgrades battle pass to premium.

**Parameters:**
- `user_id`: User's UUID

**Returns:** VOID

**Throws:**
- 'User economy not found' if user doesn't exist
- 'Already premium' if already premium

**Note:** In production, this would check for payment first.

**Example:**
```typescript
const { error } = await supabase.rpc('purchase_battle_pass_premium', {
  user_id: userId
})
```

### Gacha

#### `perform_gacha_pull(user_id UUID, pool_id TEXT, pull_count INT)`
Performs gacha pull with server-side logic.

**Parameters:**
- `user_id`: User's UUID
- `pool_id`: Gacha pool ID
- `pull_count`: Number of pulls (1 or 10)

**Returns:** JSONB with pull results

**Response Structure:**
```json
{
  "pool_id": "seasonal_spring",
  "pool_name": "Spring Blossom Gacha",
  "items": [
    {
      "id": "acc_spring_2",
      "name": "Cherry Blossom Ribbon",
      "type": "accessory",
      "rarity": "rare"
    }
  ],
  "currency": "gems",
  "cost": 100,
  "pity_counter": 1,
  "is_pity": false
}
```

**Throws:**
- 'Invalid pull count' if not 1 or 10
- 'User economy not found' if user doesn't exist
- 'Insufficient gems' if balance is too low

**Behavior:**
- Checks user balance
- Spends currency
- Performs random pulls based on probability
- Tracks pity counter
- Records pull in gacha_pulls table
- Returns pulled items

**Example:**
```typescript
const { data, error } = await supabase.rpc('perform_gacha_pull', {
  user_id: userId,
  pool_id: 'seasonal_spring',
  pull_count: 1
})

if (data) {
  console.log(`Pulled ${data.items.length} items`)
  data.items.forEach(item => {
    console.log(`- ${item.name} (${item.rarity})`)
  })
}
```

### Inventory

#### `add_to_inventory(user_id UUID, item_id TEXT, item_type TEXT, item_name TEXT, item_rarity TEXT, quantity INT, metadata JSONB)`
Adds item to user's inventory.

**Parameters:**
- `user_id`: User's UUID
- `item_id`: Item ID
- `item_type`: Item type
- `item_name`: Item name
- `item_rarity`: Item rarity (default: 'common')
- `quantity`: Quantity to add (default: 1)
- `metadata`: Additional item data (default: {})

**Returns:** VOID

**Behavior:**
- Updates quantity if item exists
- Inserts new item if doesn't exist

**Example:**
```typescript
const { error } = await supabase.rpc('add_to_inventory', {
  user_id: userId,
  item_id: 'food_apple',
  item_type: 'food',
  item_name: 'Apple',
  item_rarity: 'common',
  quantity: 5
})
```

#### `remove_from_inventory(user_id UUID, item_id TEXT, quantity INT)`
Removes item from user's inventory.

**Parameters:**
- `user_id`: User's UUID
- `item_id`: Item ID
- `quantity`: Quantity to remove (default: 1)

**Returns:** VOID

**Throws:**
- 'Item not found in inventory' if item doesn't exist
- 'Insufficient quantity' if quantity > available

**Behavior:**
- Updates quantity if remaining > 0
- Deletes item if quantity = available

**Example:**
```typescript
const { error } = await supabase.rpc('remove_from_inventory', {
  user_id: userId,
  item_id: 'food_apple',
  quantity: 2
})
```

## Deployment Steps

### 1. Apply Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy contents of supabase/migrations/20260508_economy_tables.sql
```

### 2. Deploy RPC Functions

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy contents of supabase/functions/economy_rpc.sql
```

### 3. Verify Deployment

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('battle_pass', 'gacha_pulls', 'purchases', 'user_economy', 'inventory');

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%_coins%'
  OR routine_name LIKE '%_gems%'
  OR routine_name LIKE 'claim_daily%'
  OR routine_name LIKE '%battle_pass%'
  OR routine_name LIKE '%gacha%'
  OR routine_name LIKE '%inventory%';
```

### 4. Test Functions

```sql
-- Test add_coins
SELECT add_coins('test-user-id', 100);

-- Test claim_daily_reward
SELECT claim_daily_reward('test-user-id');

-- Test perform_gacha_pull
SELECT perform_gacha_pull('test-user-id', 'seasonal_spring', 1);
```

## Frontend Integration

### Update Economy Store

The economy store in `src/features/economy/economyStore.ts` already calls these RPC functions. No changes needed.

### Example Usage

```typescript
import { useEconomyStore } from '@/features/economy/economyStore'

function MyComponent() {
  const { 
    addCoins, 
    addGems, 
    spendCoins, 
    spendGems,
    claimDailyReward,
    addBattlePassXP,
    claimBattlePassReward,
    purchaseBattlePassPremium,
    pullGacha
  } = useEconomyStore()
  
  const handleAddCoins = async () => {
    try {
      await addCoins(100)
      console.log('Coins added!')
    } catch (error) {
      console.error('Failed to add coins:', error)
    }
  }
  
  const handleClaimDaily = async () => {
    try {
      const reward = await claimDailyReward()
      console.log(`Claimed: ${reward.coins} coins, ${reward.gems} gems`)
    } catch (error) {
      console.error('Failed to claim:', error)
    }
  }
  
  const handleGachaPull = async () => {
    try {
      const result = await pullGacha('seasonal_spring', 1)
      console.log(`Pulled ${result.items.length} items`)
    } catch (error) {
      console.error('Gacha pull failed:', error)
    }
  }
  
  return (
    <div>
      <button onClick={handleAddCoins}>Add 100 Coins</button>
      <button onClick={handleClaimDaily}>Claim Daily Reward</button>
      <button onClick={handleGachaPull}>Pull Gacha</button>
    </div>
  )
}
```

## Security Considerations

### Row Level Security (RLS)
All tables have RLS policies enabled:
- Users can only see their own data
- Users can only insert their own data
- Users can only update their own data

### Server-Side Validation
All RPC functions include:
- Input validation (positive amounts, valid types)
- Balance checks before spending
- Duplicate claim prevention
- Pity system enforcement

### Error Handling
All functions throw descriptive exceptions:
- 'Amount must be positive'
- 'Insufficient coins/gems'
- 'Daily reward already claimed today'
- 'Level not unlocked yet'
- 'Premium battle pass required'
- 'Reward already claimed'

## Monitoring

### Key Metrics to Track

1. **Economy Health**
   - Total coins in circulation
   - Total gems in circulation
   - Average user balance
   - Daily transaction volume

2. **Battle Pass**
   - Premium conversion rate
   - Average level reached
   - Reward claim rate

3. **Gacha**
   - Pull frequency
   - Pity trigger rate
   - Average pulls per user

4. **Daily Rewards**
   - Daily claim rate
   - Average streak length
   - Day 7 completion rate

### Queries for Monitoring

```sql
-- Economy health
SELECT 
  SUM(coins) as total_coins,
  SUM(gems) as total_gems,
  AVG(coins) as avg_coins,
  AVG(gems) as avg_gems,
  COUNT(*) as total_users
FROM user_economy;

-- Battle pass stats
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN is_premium THEN 1 ELSE 0 END) as premium_users,
  AVG(current_level) as avg_level,
  MAX(current_level) as max_level
FROM battle_pass
WHERE season_id = 'season_1';

-- Gacha stats
SELECT 
  COUNT(*) as total_pulls,
  SUM(CASE WHEN is_pity THEN 1 ELSE 0 END) as pity_pulls,
  AVG(cost) as avg_cost,
  COUNT(DISTINCT user_id) as unique_users
FROM gacha_pulls;

-- Daily rewards stats
SELECT 
  COUNT(*) as total_claims,
  AVG(daily_streak) as avg_streak,
  MAX(daily_streak) as max_streak
FROM user_economy
WHERE last_daily_claim IS NOT NULL;
```

## Troubleshooting

### Common Issues

#### 1. "User economy not found"
**Cause:** User doesn't have a record in user_economy table
**Solution:** The RPC functions should auto-create records. Check if RLS is blocking inserts.

#### 2. "Insufficient coins/gems"
**Cause:** User doesn't have enough balance
**Solution:** Check user's balance before spending. Display error to user.

#### 3. "Daily reward already claimed today"
**Cause:** User already claimed today
**Solution:** Show "Already claimed" UI instead of error.

#### 4. "Level not unlocked yet"
**Cause:** Trying to claim reward for unearned level
**Solution:** Check current level before allowing claim.

#### 5. "Premium battle pass required"
**Cause:** Trying to claim premium reward without premium
**Solution:** Show upgrade prompt instead of error.

### Debug Mode

Enable debug logging in Supabase:

```sql
-- Enable statement logging
ALTER DATABASE SET log_statement = 'all';

-- Check logs in Supabase Dashboard
-- Database > Logs > Query Insights
```

## Next Steps

1. **Payment Processing**
   - Integrate Stripe for real-money purchases
   - Add webhook handlers for payment confirmation
   - Implement refund logic

2. **Gacha Pool Management**
   - Create gacha_pools table for dynamic pool configuration
   - Add admin interface for pool management
   - Implement seasonal pool rotation

3. **Battle Pass Rewards**
   - Create battle_pass_rewards table for reward configuration
   - Add admin interface for reward management
   - Implement seasonal reward rotation

4. **Analytics**
   - Set up event tracking for economy actions
   - Create dashboards for monitoring
   - Implement alerting for anomalies

5. **Testing**
   - Write integration tests for all RPC functions
   - Test edge cases (negative amounts, insufficient balance, etc.)
   - Load test high-traffic scenarios

## Support

For issues or questions:
1. Check Supabase logs in the dashboard
2. Review RPC function error messages
3. Verify RLS policies are correctly configured
4. Test functions in SQL Editor before using in production

---

**Last Updated:** May 8, 2026
**Version:** 1.0