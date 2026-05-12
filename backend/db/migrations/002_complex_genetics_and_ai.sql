-- Add complex genetics and AI state fields to pets table

-- 1. Add new columns
ALTER TABLE pets ADD COLUMN IF NOT EXISTS complex_genetics JSONB DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS ai_state JSONB DEFAULT '{}';

-- 2. Migrate existing simple genetics to complex_genetics if needed
-- (Optional: For existing rows, we can wrap simple fields into the new JSONB)
UPDATE pets SET complex_genetics = jsonb_build_object(
    'baseHungerRate', base_hunger_rate,
    'baseMoodRate', base_mood_rate,
    'baseEnergyRate', base_energy_rate,
    'growthSpeed', growth_speed,
    'personality', personality,
    'isMutant', false,
    'generation', 0,
    'color', '#FFD700',
    'colorName', 'Golden Default',
    'alleles', '{}'::jsonb
) WHERE complex_genetics = '{}';

-- 3. We can keep the old columns for a while or drop them later
-- ALTER TABLE pets DROP COLUMN base_hunger_rate;
-- ALTER TABLE pets DROP COLUMN base_mood_rate;
-- ALTER TABLE pets DROP COLUMN base_energy_rate;
-- ALTER TABLE pets DROP COLUMN growth_speed;
-- ALTER TABLE pets DROP COLUMN personality;
