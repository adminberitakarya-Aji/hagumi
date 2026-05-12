-- HAGUMI INITIAL SCHEMA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  coins         INTEGER NOT NULL DEFAULT 200,
  gems          INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PETS
CREATE TABLE public.pets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  gender              TEXT NOT NULL CHECK (gender IN ('male','female')),
  stage               TEXT NOT NULL CHECK (stage IN ('egg','baby','child','teen','adult','elder','dead')),
  genetics            JSONB NOT NULL DEFAULT '{}',
  stats               JSONB NOT NULL DEFAULT '{"hunger":100,"mood":100,"energy":100,"health":100,"growth":0}',
  day_age             INTEGER NOT NULL DEFAULT 0,
  last_fed            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  born_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own pets" ON public.pets FOR ALL USING (auth.uid() = user_id);

-- INVENTORY
CREATE TABLE public.inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own inventory" ON public.inventory FOR ALL USING (auth.uid() = user_id);
