-- Social Features Migration
-- Version: 003
-- Date: 2026-05-11
-- Description: Add tables for friends and visits

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

-- Index for friends lookups
CREATE INDEX IF NOT EXISTS idx_friends_user1 ON friends(user1_id);
CREATE INDEX IF NOT EXISTS idx_friends_user2 ON friends(user2_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    message TEXT,
    reward_given JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for visits lookups
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_host ON visits(host_id);
CREATE INDEX IF NOT EXISTS idx_visits_pet ON visits(pet_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);

-- Create activity_feed table (for social feed)
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'growth', 'achievement', 'visit', 'friend'
    content JSONB NOT NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for activity feed
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at);

-- Trigger for updated_at on friends
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
