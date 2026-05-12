-- Economy & Monetization RPC Functions
-- These functions handle all economy operations server-side
-- Created: May 8, 2026

-- ============================================
-- CURRENCY OPERATIONS
-- ============================================

-- Add coins to user's balance
CREATE OR REPLACE FUNCTION add_coins(user_id UUID, amount BIGINT)
RETURNS VOID AS $$
BEGIN
    -- Validate amount
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;
    
    -- Update user_economy table
    INSERT INTO user_economy (user_id, coins, total_coins_earned)
    VALUES (user_id, amount, amount)
    ON CONFLICT (user_id) DO UPDATE SET
        coins = user_economy.coins + amount,
        total_coins_earned = user_economy.total_coins_earned + amount,
        updated_at = NOW();
    
    -- Also update profiles table for backward compatibility
    UPDATE profiles
    SET coins = profiles.coins + amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add gems to user's balance
CREATE OR REPLACE FUNCTION add_gems(user_id UUID, amount BIGINT)
RETURNS VOID AS $$
BEGIN
    -- Validate amount
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;
    
    -- Update user_economy table
    INSERT INTO user_economy (user_id, gems, total_gems_earned)
    VALUES (user_id, amount, amount)
    ON CONFLICT (user_id) DO UPDATE SET
        gems = user_economy.gems + amount,
        total_gems_earned = user_economy.total_gems_earned + amount,
        updated_at = NOW();
    
    -- Also update profiles table for backward compatibility
    UPDATE profiles
    SET gems = profiles.gems + amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Spend coins from user's balance
CREATE OR REPLACE FUNCTION spend_coins(user_id UUID, amount BIGINT)
RETURNS VOID AS $$
DECLARE
    current_balance BIGINT;
BEGIN
    -- Validate amount
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;
    
    -- Check if user has enough coins
    SELECT coins INTO current_balance
    FROM user_economy
    WHERE user_id = user_id;
    
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User economy not found';
    END IF;
    
    IF current_balance < amount THEN
        RAISE EXCEPTION 'Insufficient coins';
    END IF;
    
    -- Update user_economy table
    UPDATE user_economy
    SET
        coins = coins - amount,
        total_coins_spent = total_coins_spent + amount,
        updated_at = NOW()
    WHERE user_id = user_id;
    
    -- Also update profiles table for backward compatibility
    UPDATE profiles
    SET coins = profiles.coins - amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Spend gems from user's balance
CREATE OR REPLACE FUNCTION spend_gems(user_id UUID, amount BIGINT)
RETURNS VOID AS $$
DECLARE
    current_balance BIGINT;
BEGIN
    -- Validate amount
    IF amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;
    
    -- Check if user has enough gems
    SELECT gems INTO current_balance
    FROM user_economy
    WHERE user_id = user_id;
    
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User economy not found';
    END IF;
    
    IF current_balance < amount THEN
        RAISE EXCEPTION 'Insufficient gems';
    END IF;
    
    -- Update user_economy table
    UPDATE user_economy
    SET
        gems = gems - amount,
        total_gems_spent = total_gems_spent + amount,
        updated_at = NOW()
    WHERE user_id = user_id;
    
    -- Also update profiles table for backward compatibility
    UPDATE profiles
    SET gems = profiles.gems - amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DAILY REWARDS
-- ============================================

-- Claim daily reward
CREATE OR REPLACE FUNCTION claim_daily_reward(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    last_claim TIMESTAMPTZ;
    current_streak INT;
    reward_day INT;
    reward_coins BIGINT;
    reward_gems BIGINT;
    reward_bonus TEXT;
    result JSONB;
BEGIN
    -- Get last claim info
    SELECT last_daily_claim, daily_streak
    INTO last_claim, current_streak
    FROM user_economy
    WHERE user_id = user_id;
    
    -- Check if already claimed today
    IF last_claim IS NOT NULL AND DATE(last_claim) = DATE(NOW()) THEN
        RAISE EXCEPTION 'Daily reward already claimed today';
    END IF;
    
    -- Calculate streak and reward day
    IF last_claim IS NULL OR DATE(last_claim) < DATE(NOW() - INTERVAL '1 day') THEN
        -- Streak reset or first claim
        current_streak := 1;
    ELSE
        -- Streak continues
        current_streak := current_streak + 1;
    END IF;
    
    -- Reset streak if > 7
    IF current_streak > 7 THEN
        current_streak := 1;
    END IF;
    
    -- Determine reward based on day
    reward_day := current_streak;
    
    CASE reward_day
        WHEN 1 THEN
            reward_coins := 50;
            reward_gems := 0;
            reward_bonus := NULL;
        WHEN 2 THEN
            reward_coins := 75;
            reward_gems := 0;
            reward_bonus := NULL;
        WHEN 3 THEN
            reward_coins := 100;
            reward_gems := 1;
            reward_bonus := NULL;
        WHEN 4 THEN
            reward_coins := 125;
            reward_gems := 1;
            reward_bonus := NULL;
        WHEN 5 THEN
            reward_coins := 150;
            reward_gems := 2;
            reward_bonus := NULL;
        WHEN 6 THEN
            reward_coins := 175;
            reward_gems := 2;
            reward_bonus := NULL;
        WHEN 7 THEN
            reward_coins := 300;
            reward_gems := 5;
            reward_bonus := 'Weekly Bonus';
    END CASE;
    
    -- Update user economy
    UPDATE user_economy
    SET
        coins = coins + reward_coins,
        gems = gems + reward_gems,
        total_coins_earned = total_coins_earned + reward_coins,
        total_gems_earned = total_gems_earned + reward_gems,
        last_daily_claim = NOW(),
        daily_streak = current_streak,
        updated_at = NOW()
    WHERE user_id = user_id;
    
    -- Also update profiles table
    UPDATE profiles
    SET
        coins = profiles.coins + reward_coins,
        gems = profiles.gems + reward_gems
    WHERE id = user_id;
    
    -- Build result
    result := jsonb_build_object(
        'day', reward_day,
        'coins', reward_coins,
        'gems', reward_gems,
        'bonus', reward_bonus,
        'streak', current_streak
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- BATTLE PASS
-- ============================================

-- Add XP to battle pass
CREATE OR REPLACE FUNCTION add_battle_pass_xp(user_id UUID, xp BIGINT)
RETURNS VOID AS $$
DECLARE
    current_level INT;
    current_xp BIGINT;
    total_xp BIGINT;
    new_level INT;
    xp_for_next_level BIGINT;
BEGIN
    -- Validate XP
    IF xp <= 0 THEN
        RAISE EXCEPTION 'XP must be positive';
    END IF;
    
    -- Get current battle pass progress
    SELECT current_level, current_xp, total_xp
    INTO current_level, current_xp, total_xp
    FROM battle_pass
    WHERE user_id = user_id AND season_id = 'season_1';
    
    -- Create battle pass if doesn't exist
    IF NOT FOUND THEN
        INSERT INTO battle_pass (user_id, season_id, season_start, season_end)
        VALUES (
            user_id,
            'season_1',
            NOW(),
            NOW() + INTERVAL '30 days'
        );
        current_level := 0;
        current_xp := 0;
        total_xp := 0;
    END IF;
    
    -- Add XP
    total_xp := total_xp + xp;
    current_xp := current_xp + xp;
    
    -- Calculate new level (simplified: 100 XP per level)
    new_level := total_xp / 100;
    
    -- Update battle pass
    UPDATE battle_pass
    SET
        current_level = new_level,
        current_xp = current_xp,
        total_xp = total_xp,
        updated_at = NOW()
    WHERE user_id = user_id AND season_id = 'season_1';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Claim battle pass reward
CREATE OR REPLACE FUNCTION claim_battle_pass_reward(user_id UUID, level INT, is_premium BOOLEAN)
RETURNS JSONB AS $$
DECLARE
    battle_pass_record RECORD;
    claimed_levels INT[];
    reward JSONB;
BEGIN
    -- Get battle pass record
    SELECT * INTO battle_pass_record
    FROM battle_pass
    WHERE user_id = user_id AND season_id = 'season_1';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Battle pass not found';
    END IF;
    
    -- Check if level is unlocked
    IF battle_pass_record.current_level < level THEN
        RAISE EXCEPTION 'Level not unlocked yet';
    END IF;
    
    -- Check if premium is required
    IF is_premium AND NOT battle_pass_record.is_premium THEN
        RAISE EXCEPTION 'Premium battle pass required';
    END IF;
    
    -- Check if already claimed
    claimed_levels := CASE
        WHEN is_premium THEN battle_pass_record.claimed_premium_levels
        ELSE battle_pass_record.claimed_free_levels
    END;
    
    IF level = ANY(claimed_levels) THEN
        RAISE EXCEPTION 'Reward already claimed';
    END IF;
    
    -- Update claimed levels
    IF is_premium THEN
        UPDATE battle_pass
        SET claimed_premium_levels = array_append(claimed_premium_levels, level),
            updated_at = NOW()
        WHERE user_id = user_id AND season_id = 'season_1';
    ELSE
        UPDATE battle_pass
        SET claimed_free_levels = array_append(claimed_free_levels, level),
            updated_at = NOW()
        WHERE user_id = user_id AND season_id = 'season_1';
    END IF;
    
    -- Return reward info (simplified - in production, this would query a rewards table)
    reward := jsonb_build_object(
        'level', level,
        'is_premium', is_premium,
        'claimed_at', NOW()
    );
    
    RETURN reward;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Purchase battle pass premium
CREATE OR REPLACE FUNCTION purchase_battle_pass_premium(user_id UUID)
RETURNS VOID AS $$
DECLARE
    current_economy RECORD;
BEGIN
    -- Get user economy
    SELECT * INTO current_economy
    FROM user_economy
    WHERE user_id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User economy not found';
    END IF;
    
    -- Check if already premium
    IF EXISTS (
        SELECT 1 FROM battle_pass
        WHERE user_id = user_id AND season_id = 'season_1' AND is_premium = TRUE
    ) THEN
        RAISE EXCEPTION 'Already premium';
    END IF;
    
    -- In production, this would check for payment
    -- For now, we'll just mark as premium
    
    -- Update or create battle pass
    INSERT INTO battle_pass (user_id, season_id, is_premium, premium_purchased_at, season_start, season_end)
    VALUES (
        user_id,
        'season_1',
        TRUE,
        NOW(),
        NOW(),
        NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        is_premium = TRUE,
        premium_purchased_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GACHA
-- ============================================

-- Perform gacha pull (server-side logic)
CREATE OR REPLACE FUNCTION perform_gacha_pull(user_id UUID, pool_id TEXT, pull_count INT)
RETURNS JSONB AS $$
DECLARE
    current_economy RECORD;
    pool_config JSONB;
    cost_per_pull BIGINT;
    total_cost BIGINT;
    currency_type TEXT;
    pity_counter INT;
    new_pity_counter INT;
    is_pity BOOLEAN;
    pull_result JSONB;
    pulled_items JSONB[];
    item_ids TEXT[];
    i INT;
    random_num NUMERIC;
    cumulative_prob NUMERIC;
    item_record JSONB;
BEGIN
    -- Validate pull count
    IF pull_count NOT IN (1, 10) THEN
        RAISE EXCEPTION 'Invalid pull count';
    END IF;
    
    -- Get user economy
    SELECT * INTO current_economy
    FROM user_economy
    WHERE user_id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User economy not found';
    END IF;
    
    -- Get pool configuration (simplified - in production, this would query a gacha_pools table)
    -- For now, using hardcoded Spring Blossom pool
    pool_config := jsonb_build_object(
        'id', 'seasonal_spring',
        'name', 'Spring Blossom Gacha',
        'cost_gems', 100,
        'pity_threshold', 90,
        'guaranteed_pity_item', 'pet_spring_1',
        'items', jsonb_build_array(
            jsonb_build_object('id', 'pet_spring_1', 'name', 'Sakura Mochi', 'type', 'pet', 'rarity', 'legendary', 'probability', 0.01),
            jsonb_build_object('id', 'acc_spring_1', 'name', 'Flower Crown', 'type', 'accessory', 'rarity', 'epic', 'probability', 0.03),
            jsonb_build_object('id', 'acc_spring_2', 'name', 'Cherry Blossom Ribbon', 'type', 'accessory', 'rarity', 'rare', 'probability', 0.10),
            jsonb_build_object('id', 'deco_spring_1', 'name', 'Sakura Tree', 'type', 'decoration', 'rarity', 'uncommon', 'probability', 0.20),
            jsonb_build_object('id', 'cosmetic_spring_1', 'name', 'Spring Background', 'type', 'cosmetic', 'rarity', 'common', 'probability', 0.66)
        )
    );
    
    -- Get cost
    cost_per_pull := (pool_config->>'cost_gems')::BIGINT;
    total_cost := cost_per_pull * pull_count;
    currency_type := 'gems';
    
    -- Check if user has enough currency
    IF currency_type = 'gems' THEN
        IF current_economy.gems < total_cost THEN
            RAISE EXCEPTION 'Insufficient gems';
        END IF;
        
        -- Spend gems
        PERFORM spend_gems(user_id, total_cost);
    ELSE
        IF current_economy.coins < total_cost THEN
            RAISE EXCEPTION 'Insufficient coins';
        END IF;
        
        -- Spend coins
        PERFORM spend_coins(user_id, total_cost);
    END IF;
    
    -- Get current pity counter
    pity_counter := COALESCE((current_economy.gacha_pity_counters->pool_id)::INT, 0);
    
    -- Perform pulls
    pulled_items := '{}';
    item_ids := '{}';
    is_pity := FALSE;
    
    FOR i IN 1..pull_count LOOP
        -- Check for pity
        IF pity_counter >= (pool_config->>'pity_threshold')::INT - 1 THEN
            -- Pity pull - guaranteed legendary
            item_record := jsonb_build_object(
                'id', pool_config->>'guaranteed_pity_item',
                'name', 'Sakura Mochi',
                'type', 'pet',
                'rarity', 'legendary'
            );
            is_pity := TRUE;
            new_pity_counter := 0;
        ELSE
            -- Normal pull - random based on probability
            random_num := random();
            cumulative_prob := 0;
            
            FOR item_record IN SELECT jsonb_array_elements(pool_config->'items') LOOP
                cumulative_prob := cumulative_prob + (item_record->>'probability')::NUMERIC;
                
                IF random_num <= cumulative_prob THEN
                    EXIT;
                END IF;
            END LOOP;
            
            new_pity_counter := pity_counter + 1;
        END IF;
        
        -- Add to results
        pulled_items := array_append(pulled_items, item_record);
        item_ids := array_append(item_ids, item_record->>'id');
        
        -- Update pity counter for next iteration
        pity_counter := new_pity_counter;
    END LOOP;
    
    -- Update pity counter in user_economy
    UPDATE user_economy
    SET
        gacha_pity_counters = jsonb_set(
            COALESCE(gacha_pity_counters, '{}'::jsonb),
            ARRAY[pool_id],
            to_jsonb(pity_counter)
        ),
        updated_at = NOW()
    WHERE user_id = user_id;
    
    -- Record pull in gacha_pulls table
    INSERT INTO gacha_pulls (
        user_id,
        pool_id,
        pool_name,
        items,
        item_ids,
        currency,
        cost,
        pity_counter,
        is_pity,
        pity_item_id
    ) VALUES (
        user_id,
        pool_id,
        pool_config->>'name',
        to_jsonb(pulled_items),
        item_ids,
        currency_type,
        total_cost,
        pity_counter,
        is_pity,
        CASE WHEN is_pity THEN pool_config->>'guaranteed_pity_item' ELSE NULL END
    );
    
    -- Build result
    pull_result := jsonb_build_object(
        'pool_id', pool_id,
        'pool_name', pool_config->>'name',
        'items', to_jsonb(pulled_items),
        'currency', currency_type,
        'cost', total_cost,
        'pity_counter', pity_counter,
        'is_pity', is_pity
    );
    
    RETURN pull_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INVENTORY
-- ============================================

-- Add item to inventory
CREATE OR REPLACE FUNCTION add_to_inventory(
    user_id UUID,
    item_id TEXT,
    item_type TEXT,
    item_name TEXT,
    item_rarity TEXT DEFAULT 'common',
    quantity INT DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    -- Try to update existing item
    UPDATE inventory
    SET
        quantity = quantity + add_to_inventory.quantity,
        metadata = COALESCE(add_to_inventory.metadata, metadata),
        updated_at = NOW()
    WHERE user_id = add_to_inventory.user_id
      AND item_id = add_to_inventory.item_id
      AND is_equipped = FALSE;
    
    -- If no rows updated, insert new item
    IF NOT FOUND THEN
        INSERT INTO inventory (
            user_id,
            item_id,
            item_type,
            item_name,
            item_rarity,
            quantity,
            metadata
        ) VALUES (
            add_to_inventory.user_id,
            add_to_inventory.item_id,
            add_to_inventory.item_type,
            add_to_inventory.item_name,
            add_to_inventory.item_rarity,
            add_to_inventory.quantity,
            add_to_inventory.metadata
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove item from inventory
CREATE OR REPLACE FUNCTION remove_from_inventory(user_id UUID, item_id TEXT, quantity INT DEFAULT 1)
RETURNS VOID AS $$
DECLARE
    current_quantity INT;
BEGIN
    -- Get current quantity
    SELECT quantity INTO current_quantity
    FROM inventory
    WHERE user_id = remove_from_inventory.user_id
      AND item_id = remove_from_inventory.item_id
      AND is_equipped = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item not found in inventory';
    END IF;
    
    IF current_quantity < quantity THEN
        RAISE EXCEPTION 'Insufficient quantity';
    END IF;
    
    -- Update or delete
    IF current_quantity = quantity THEN
        DELETE FROM inventory
        WHERE user_id = remove_from_inventory.user_id
          AND item_id = remove_from_inventory.item_id
          AND is_equipped = FALSE;
    ELSE
        UPDATE inventory
        SET
            quantity = quantity - remove_from_inventory.quantity,
            updated_at = NOW()
        WHERE user_id = remove_from_inventory.user_id
          AND item_id = remove_from_inventory.item_id
          AND is_equipped = FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================

-- Grant execute on all functions to authenticated users
GRANT EXECUTE ON FUNCTION add_coins TO authenticated;
GRANT EXECUTE ON FUNCTION add_gems TO authenticated;
GRANT EXECUTE ON FUNCTION spend_coins TO authenticated;
GRANT EXECUTE ON FUNCTION spend_gems TO authenticated;
GRANT EXECUTE ON FUNCTION claim_daily_reward TO authenticated;
GRANT EXECUTE ON FUNCTION add_battle_pass_xp TO authenticated;
GRANT EXECUTE ON FUNCTION claim_battle_pass_reward TO authenticated;
GRANT EXECUTE ON FUNCTION purchase_battle_pass_premium TO authenticated;
GRANT EXECUTE ON FUNCTION perform_gacha_pull TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION remove_from_inventory TO authenticated;