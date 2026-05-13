-- Initial Schema Migration
-- Version: 001
-- Date: 2026-05-09
-- Description: Create initial database schema for HAGUMI-APP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(20) NOT NULL,
    stage VARCHAR(20) DEFAULT 'egg',
    hunger INTEGER DEFAULT 100 CHECK (hunger >= 0 AND hunger <= 100),
    mood INTEGER DEFAULT 100 CHECK (mood >= 0 AND mood <= 100),
    energy INTEGER DEFAULT 100 CHECK (energy >= 0 AND energy <= 100),
    health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
    base_hunger_rate DECIMAL(3,2) DEFAULT 1.00 CHECK (base_hunger_rate >= 0.1 AND base_hunger_rate <= 2.0),
    base_mood_rate DECIMAL(3,2) DEFAULT 1.00 CHECK (base_mood_rate >= 0.1 AND base_mood_rate <= 2.0),
    base_energy_rate DECIMAL(3,2) DEFAULT 1.00 CHECK (base_energy_rate >= 0.1 AND base_energy_rate <= 2.0),
    growth_speed DECIMAL(3,2) DEFAULT 1.00 CHECK (growth_speed >= 0.1 AND growth_speed <= 2.0),
    personality VARCHAR(20) DEFAULT 'playful' CHECK (personality IN ('playful', 'calm', 'energetic', 'grumpy', 'affectionate', 'lazy', 'curious', 'brave')),
    day_age INTEGER DEFAULT 0 CHECK (day_age >= 0),
    born_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for pets
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_stage ON pets(stage);
CREATE INDEX IF NOT EXISTS idx_pets_is_active ON pets(is_active);
CREATE INDEX IF NOT EXISTS idx_pets_updated_at ON pets(updated_at);

-- Create sessions table for session management
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_access_token ON sessions(access_token);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for audit logging
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
    audit_user_id UUID;
    audit_entity_id UUID;
    record_json JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        record_json := row_to_json(OLD)::JSONB;
    ELSE
        record_json := row_to_json(NEW)::JSONB;
    END IF;

    -- Try to get user_id, fallback to id if the table is 'users'
    IF TG_TABLE_NAME = 'users' THEN
        audit_user_id := (record_json->>'id')::UUID;
    ELSE
        audit_user_id := (record_json->>'user_id')::UUID;
    END IF;

    audit_entity_id := (record_json->>'id')::UUID;

    INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_data, new_data)
    VALUES (
        audit_user_id,
        TG_OP,
        TG_TABLE_NAME,
        audit_entity_id,
        row_to_json(OLD),
        row_to_json(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_pets_changes AFTER INSERT OR UPDATE OR DELETE ON pets
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_users_changes AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();