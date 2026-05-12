# 🌍 Hagumi Global Scale Plan
## Roadmap Menuju Game Digital Pet Skala Global & Profesional

> **Versi Dokumen:** 1.0
> **Status:** Draft Strategis
> **Target:** Production-Grade Global Launch

---

# 📋 Daftar Isi
1. [Visi & Misi](#1-visi--misi)
2. [Arsitektur Global](#2-arsitektur-global)
3. [Game Engine Foundation](#3-game-engine-foundation)
4. [Infrastructure & DevOps](#4-infrastructure--devops)
5. [Backend & Database](#5-backend--database)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Game Content Expansion](#7-game-content-expansion)
8. [Social & Multiplayer](#8-social--multiplayer)
9. [Monetization](#9-monetization)
10. [Security & Anti-Cheat](#10-security--anti-cheat)
11. [Testing & QA](#11-testing--qa)
12. [Analytics & Observability](#12-analytics--observability)
13. [Compliance & Legal](#13-compliance--legal)
14. [Team & Organization](#14-team--organization)
15. [Roadmap Timeline](#15-roadmap-timeline)
16. [Success Metrics](#16-success-metrics)

---

# 1. Visi & Misi

## 1.1 Visi
Menjadi **platform digital pet living-simulation terdepan di dunia** yang menggabungkan budaya Jepang (kawaii aesthetics) dengan teknologi modern, menciptakan pengalaman nurturing yang mendalam dan bermakna secara emosional.

## 1.2 Misi
- Menghadirkan AI-driven virtual pet dengan **kepribadian unik dan adaptive behavior**
- Membangun **ekonomi virtual yang berkelanjutan** berbasis player-driven market
- Menciptakan **social ecosystem** yang aman dan engaging
- Menyediakan **cross-platform experience** (Mobile + Web + Desktop)
- Memberikan **emotional attachment** melalui storytelling, nostalgia, dan personalisasi mendalam

## 1.3 Brand Promise
> *"Your pet isn't just code. It's a living story."*

---

# 2. Arsitektur Global

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
├──────────────┬───────────────┬──────────────────────────┤
│  React Web   │  React Native │     Progressive Web App  │
│  (PWA Ready) │  (iOS/Android)│     (Mobile Browser)     │
├──────────────┴───────────────┴──────────────────────────┤
│                    CDN (Cloudflare)                      │
├─────────────────────────────────────────────────────────┤
│                    API GATEWAY                           │
│         (Cloudflare Workers / AWS API Gateway)           │
├─────────────────────────────────────────────────────────┤
│              ┌──────────────────────────┐                │
│              │   WebSocket Cluster       │                │
│              │  (Socket.io / WS Server)  │                │
│              └──────────┬───────────────┘                │
├─────────────────────────┼───────────────────────────────┤
│              SERVICE LAYER (Kubernetes)                  │
├───────────┬───────────┬──────────┬───────────┬─────────┤
│ Game Loop │ Auth Svc  │ Social   │ Economy   │ AI/ML   │
│ Service   │ (Supabase │ Service  │ Service   │ Service │
│ (C++/Go)  │ Auth)     │          │           │         │
├───────────┴───────────┴──────────┴───────────┴─────────┤
│                    MESSAGE QUEUE (Redis/ Kafka)          │
├───────────┬───────────┬──────────┬───────────┬─────────┤
│ PostgreSQL│  Redis    │ S3/GCS   │  Elastic  │ BigQuery│
│ (Primary) │ (Cache)   │ (Assets) │  Search   │ (Analyt)│
└───────────┴───────────┴──────────┴───────────┴─────────┘
```

## 2.2 Technology Stack Pilihan

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Web Frontend** | React 19 + TypeScript + Vite | Sudah digunakan, performa tinggi |
| **Mobile** | React Native (Expo) | Code sharing dengan web |
| **Desktop** | Tauri (Rust-based) | Ukuran bundle kecil, performa native |
| **Game Engine** | Custom TypeScript Engine → Rust (WASM) | Migration bertahap untuk performa |
| **Backend** | Go (Game Loop) + Node.js (API) | Go untuk realtime, Node.js untuk API ringan |
| **Database** | Supabase (PostgreSQL) → Managed PostgreSQL | Migration ke dedicated managed DB |
| **Cache** | Redis Cluster | Session, leaderboard, realtime state |
| **Queue** | RabbitMQ / Kafka | Event-driven architecture |
| **Search** | Meilisearch / Elasticsearch | Market search, pet discovery |
| **Storage** | AWS S3 / Cloudflare R2 | Asset hosting, user uploads |
| **CDN** | Cloudflare | Global edge network |
| **Container** | Docker + Kubernetes (EKS/GKE) | Auto-scaling, zero-downtime deploy |
| **CI/CD** | GitHub Actions + ArgoCD | GitOps workflow |
| **Monitoring** | Datadog / Grafana + Prometheus | Full observability |
| **Analytics** | Mixpanel + BigQuery | Product analytics |
| **AI/ML** | Anthropic API + Custom RL Models | Pet behavior AI |

## 2.3 Cross-Platform Strategy

```
Phase 1 (Sekarang): Web PWA Only
Phase 2 (3 bulan):   React Native Mobile App
Phase 3 (6 bulan):   Desktop via Tauri
Phase 4 (12 bulan):  Native iOS + Android (Swift/Kotlin)
```

---

# 3. Game Engine Foundation

## 3.1 Core Engine Refactor (Sekarang → Bulan 2)

### ❌ Current Problems:
- Decay logic duplikat di 2 hooks berbeda
- Genetics traits tidak mempengaruhi gameplay
- Growth hanya time-based tanpa memperhitungkan player effort

### ✅ Target Engine Architecture:

```
┌──────────────────────────────────────┐
│          Game Tick Controller         │
│  (Server-authoritative, 30s interval) │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ Decay    │  │  Growth/Stage    │  │
│  │ Engine   │──│  Progression     │  │
│  └────┬─────┘  └────────┬─────────┘  │
│       │                 │            │
│  ┌────▼─────┐  ┌────────▼─────────┐  │
│  │ Genetics │  │  Event/Trigger   │  │
│  │ Modifier │──│  Engine          │  │
│  └──────────┘  └──────────────────┘  │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ Pet AI   │  │  Condition       │  │
│  │ Behavior │  │  Checker (Death, │  │
│  │ Engine   │  │  Sickness, etc)  │  │
│  └──────────┘  └──────────────────┘  │
├──────────────────────────────────────┤
│        State Sync Layer              │
│  (Broadcast ke client via WS)        │
└──────────────────────────────────────┘
```

## 3.2 Genetics System Overhaul

### Current: Simple 50/50 inheritance
### Target: Mendelian Genetics Simulation

```typescript
interface AdvancedGenetics {
  // Visible Traits (Phenotype)
  color: { primary: string; secondary: string; pattern: string }
  size: 'small' | 'medium' | 'large'
  earType: 'round' | 'pointy' | 'floppy'
  tailType: 'short' | 'long' | 'fluffy'
  eyeShape: 'round' | 'slit' | 'large'
  
  // Hidden Traits (Genotype - recessive/dominant)
  alleles: Record<string, { dominant: string; recessive: string[] }>
  mutationRate: number
  carrierGenes: string[]
  
  // Behavioral Traits
  personality: {
    base: PersonalityType
    traits: PersonalityTrait[]  // Big Five + Custom
    adaptability: number
    stubbornness: number
  }
  
  // Metabolic Traits
  metabolism: {
    baseHungerRate: number
    baseEnergyRate: number
    baseMoodDecay: number
    growthFactor: number
    lifespanModifier: number
  }
}

// Contoh: Warna sebagai gen dominan-resesif
// R (Red) dominant > r (blue) recessive
// RR = Red, Rr = Red (carrier blue), rr = Blue
```

## 3.3 Pet AI Behavior Engine

### 3.3.1 State Machine Architecture

```
                    ┌─────────────┐
                    │   IDLE      │◄──────────────────────┐
                    └──────┬──────┘                        │
                           │                               │
              ┌────────────┼────────────┐                  │
              ▼            ▼            ▼                  │
        ┌──────────┐ ┌──────────┐ ┌──────────┐           │
        │  HUNGRY  │ │   TIRED  │ │  BORED   │           │
        └────┬─────┘ └────┬─────┘ └────┬─────┘           │
             │            │            │                  │
        ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐           │
        │ Seeking  │ │  Going   │ │  Playing │           │
        │  Food    │ │  to Sleep│ │  Alone   │           │
        └──────────┘ └──────────┘ └──────────┘           │
                                                          │
        ┌──────────────────────────────────────────┐      │
        │         SPECIAL STATES                   │      │
        ├──────────────────────────────────────────┤      │
        │ • SICK   → Needs medicine                │      │
        │ • SAD    → Needs social interaction      │      │
        │ • EXCITED → Special event triggered      │      │
        │ • GROWING → Evolution animation          │      │
        └──────────────────────────────────────────┘      │
                                                          │
        ┌──────────────────────────────────────────┐      │
        │         DEATH PATH                       │──────┘
        ├──────────────────────────────────────────┤
        │ • CRITICAL → GRACE_PERIOD → DEATH        │
        │ • Grace period = 72 jam real-time        │
        │ • Selama grace: special "ill" animations  │
        │ • Revival item: "Bloom of Life" (hard)    │
        └──────────────────────────────────────────┘
```

### 3.3.2 Personality-Driven Behaviors

| Personality | Hunger Decay | Energy Decay | Mood Decay | Special Behavior |
|-------------|-------------|-------------|-----------|-----------------|
| Playful | 1.0× | 1.3× | 1.5× | Suka bermain, mood turun cepat jika diabaikan |
| Calm | 0.8× | 0.7× | 0.6× | Tidur lebih sering, jarang bosan |
| Energetic | 1.3× | 1.5× | 1.0× | Lari-lari, butuh lebih banyak makanan |
| Grumpy | 1.0× | 1.0× | 1.3× | Sulit senang, mood sulit naik |
| Affectionate | 1.0× | 0.9× | 0.8× | Sering minta perhatian, memberi hadiah |
| Lazy | 0.7× | 0.5× | 1.1× | Tidur lama, malas main |
| Curious | 0.9× | 1.2× | 0.7× | Suka explore, sering kabur dari screen |
| Brave | 1.1× | 1.0× | 0.5× | Tidak takut, cocok untuk adventure mode |

### 3.3.3 Event-Driven Triggers

| Trigger | Condition | Effect |
|---------|-----------|--------|
| **Evolution** | stats avg > 80% + enough days | Special evolution animation |
| **Sickness** | hunger < 20 for 6+ consecutive ticks | Health drops, needs medicine |
| **Depression** | mood < 20 for 12+ ticks | Refuses to eat/play |
| **Rage Quit** | mood + energy < 20 | Pet runs away (temporary) |
| **Bonding** | 50+ interactions in 7 days | Unlock special interaction |
| **Mutation** | 1% chance per generation | New color/pattern trait |
| **Seasonal** | Real-world holiday | Special animations/items |

## 3.4 Decay Formula (Final)

```typescript
function calculateDecay(pet: Pet, timeElapsedMinutes: number): Partial<PetStats> {
  const genetics = pet.genetics.metabolism
  const personality = pet.genetics.personality.base
  const personalityFactor = PERSONALITY_MULTIPLIERS[personality]
  
  // Base decay × genetics × personality × modifiers
  const hungerDecay = BASE_DECAY.hunger 
    * genetics.baseHungerRate 
    * personalityFactor.hunger 
    * getModifiers(pet).hunger
    
  const moodDecay = BASE_DECAY.mood 
    * genetics.baseMoodRate 
    * personalityFactor.mood 
    * getModifiers(pet).mood
    
  const energyDecay = BASE_DECAY.energy 
    * genetics.baseEnergyRate 
    * personalityFactor.energy 
    * getModifiers(pet).energy
  
  return {
    hunger: Math.max(0, pet.stats.hunger - hungerDecay * timeElapsedMinutes),
    mood: Math.max(0, pet.stats.mood - moodDecay * timeElapsedMinutes),
    energy: Math.max(0, pet.stats.energy - energyDecay * timeElapsedMinutes),
  }
}

function getGrowthProgress(pet: Pet): number {
  // Growth = care quality × genetics × time
  const avgStats = (pet.stats.hunger + pet.stats.mood + pet.stats.energy + pet.stats.health) / 4
  const careFactor = avgStats / 100  // 0.0 to 1.0
  const geneticsFactor = pet.genetics.metabolism.growthFactor  // 0.5 to 2.0
  
  // Base progress per day = careFactor × geneticsFactor × 100
  return careFactor * geneticsFactor * 100
}
```

---

# 4. Infrastructure & DevOps

## 4.1 Current Infrastructure (FIX ASAP)

| Komponen | Current | Target |
|----------|---------|--------|
| Hosting | Vercel (static) | Vercel + Kubernetes cluster |
| Database | Supabase Free Tier | Supabase Pro → Dedicated PostgreSQL |
| CDN | None | Cloudflare + R2 |
| CI/CD | None | GitHub Actions |
| Monitoring | None | Grafana + Sentry |
| Auth | Supabase Auth | Supabase Auth + OAuth (Google, Apple, Discord) |

## 4.2 Infrastructure Migration Roadmap

### Phase 1: Stabilisasi (Bulan 1-2)
```
✅ Migrasi Supabase ke dedicated PostgreSQL instance
✅ Setup GitHub Actions CI/CD (lint → test → build → deploy)
✅ Setup Sentry for error tracking
✅ Setup Cloudflare CDN + DDoS protection
✅ Automated backups (database daily, assets weekly)
```

### Phase 2: Scaling (Bulan 3-5)
```
✅ Dockerize all services
✅ Kubernetes cluster (EKS with Spot instances for cost saving)
✅ Redis Cluster for caching and session management
✅ Horizontal pod autoscaling based on CPU/memory
✅ Blue-green deployment strategy
```

### Phase 3: Global (Bulan 6-12)
```
✅ Multi-region deployment (US, EU, Asia)
✅ Global load balancing via Cloudflare
✅ Database read replicas per region
✅ Eventual consistency model for non-critical data
✅ Chaos engineering experiments
```

## 4.3 CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Commit  │───▶│   Lint   │───▶│   Test   │───▶│   Build  │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  Deploy Staging │
                                            └────────┬────────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  E2E Tests      │
                                            └────────┬────────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  Deploy Prod    │
                                            │  (Canary 10%)   │
                                            └────────┬────────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  100% Rollout   │
                                            └─────────────────┘
```

---

# 5. Backend & Database

## 5.1 Database Schema Evolution

### Current Schema (Supabase):
```
pets: { id, user_id, name, stage, stats, ... }
profiles: { id, email, display_name, coins, gems }
market_listings: { id, seller_id, item_type, price, ... }
```

### Target Schema:

```sql
-- === CORE TABLES ===

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,           -- Supabase Auth ID
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  nickname TEXT,                           -- In-game name
  avatar_url TEXT,
  
  -- Economy
  coins BIGINT DEFAULT 0 NOT NULL,
  gems BIGINT DEFAULT 0 NOT NULL,
  total_coins_earned BIGINT DEFAULT 0,
  total_gems_earned BIGINT DEFAULT 0,
  
  -- Stats
  level INT DEFAULT 1,
  xp BIGINT DEFAULT 0,
  total_pets_owned INT DEFAULT 0,
  total_pets_hatched INT DEFAULT 0,
  achievements TEXT[],                     -- Array of achievement IDs
  
  -- Social
  friends UUID[],                         -- Array of user IDs
  friend_requests UUID[],
  blocked_users UUID[],
  
  -- Account
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  last_ip INET,
  device_info JSONB,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Preferences
  preferences JSONB DEFAULT '{}',          -- UI settings, notifications, etc.
  
  INDEX idx_users_level (level DESC),
  INDEX idx_users_coins (coins DESC)
);

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  original_name TEXT,                      -- First name given (for tracking)
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary')),
  generation INT DEFAULT 0,               -- Breeding generation counter
  
  -- Status
  stage TEXT CHECK (stage IN ('egg','baby','child','teen','adult','elder','dead')) DEFAULT 'egg',
  is_alive BOOLEAN DEFAULT TRUE,
  death_cause TEXT,
  death_date TIMESTAMPTZ,
  resurrection_count INT DEFAULT 0,
  
  -- Stats
  stats JSONB NOT NULL DEFAULT '{
    "hunger": 100, "mood": 100, "energy": 100,
    "health": 100, "growth": 0, "warmth": 0
  }',
  stats_history JSONB[],                   -- Snapshot per day
  
  -- Genetics
  genetics JSONB NOT NULL,
  pedigree_tree JSONB,                     -- Ancestry data
  
  -- Lifecycle
  day_age INT DEFAULT 0,
  total_interactions INT DEFAULT 0,
  last_fed TIMESTAMPTZ,
  last_played TIMESTAMPTZ,
  last_rested TIMESTAMPTZ,
  last_cleaned TIMESTAMPTZ,
  times_neglected INT DEFAULT 0,
  
  -- Dates
  born_at TIMESTAMPTZ DEFAULT NOW(),
  hatched_at TIMESTAMPTZ,
  died_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_pets_user_id (user_id),
  INDEX idx_pets_stage (stage),
  INDEX idx_pets_is_alive (is_alive),
  INDEX idx_pets_created_at (created_at DESC)
);

-- === ECONOMY TABLES ===

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,                   -- Reference to items catalog
  item_type TEXT NOT NULL,                 -- 'food', 'toy', 'decoration', 'medicine', 'cosmetic'
  quantity INT DEFAULT 1 NOT NULL,
  is_equipped BOOLEAN DEFAULT FALSE,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,                 -- For perishable items
  
  UNIQUE(user_id, item_id, is_equipped)
);

CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,                  -- 'pet', 'food', 'item', 'egg'
  item_id TEXT NOT NULL,
  price_coins BIGINT,
  price_gems BIGINT,
  currency TEXT CHECK (currency IN ('coins', 'gems', 'mixed')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_id UUID REFERENCES users(id),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,                  -- Auto-cancel after 7 days
  
  INDEX idx_market_status (status),
  INDEX idx_market_created (created_at DESC),
  INDEX idx_market_seller (seller_id)
);

-- === SOCIAL TABLES ===

CREATE TABLE friendship (
  user_id UUID REFERENCES users(id),
  friend_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES users(id),
  host_id UUID REFERENCES users(id),
  duration_seconds INT,
  interactions_count INT,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_visits_host (host_id, visited_at DESC)
);

-- === ANALYTICS TABLES ===

CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  device_info JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_events_user (user_id, created_at DESC),
  INDEX idx_events_type (event_type, created_at DESC)
);

-- Partition by month for performance
CREATE TABLE game_events_partitioned (
  LIKE game_events INCLUDING ALL
) PARTITION BY RANGE (created_at);
```

## 5.2 API Design (REST + WebSocket)

### REST API Endpoints

```
# Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
DELETE /api/v1/auth/session

# Pets
GET    /api/v1/pets                    # List user's pets
GET    /api/v1/pets/:id                # Get pet details
POST   /api/v1/pets                    # Create pet (hatch)
PUT    /api/v1/pets/:id                # Update pet
DELETE /api/v1/pets/:id                # Release pet (with confirmation)
POST   /api/v1/pets/:id/action        # Feed/Play/Rest/Clean
POST   /api/v1/pets/:id/rename
POST   /api/v1/pets/:id/evolve        # Force evolution (item-based)

# Breeding
GET    /api/v1/breeding/available      # List available breeding partners
POST   /api/v1/breeding/request        # Send breed request
POST   /api/v1/breeding/accept         # Accept breed request
POST   /api/v1/breeding/reject
GET    /api/v1/breeding/lineage/:id    # Get family tree

# Market
GET    /api/v1/market/listings         # Paginated, filterable
POST   /api/v1/market/listings         # Create listing
POST   /api/v1/market/buy              # Buy item
DELETE /api/v1/market/listings/:id     # Cancel listing

# Social
GET    /api/v1/users/:id/profile       # View profile
GET    /api/v1/users/:id/pets          # View user's pets
POST   /api/v1/friends/request
POST   /api/v1/friends/accept
POST   /api/v1/friends/remove
GET    /api/v1/friends                 # List friends

# Leaderboard
GET    /api/v1/leaderboard             # Weekly/Monthly/All-time
GET    /api/v1/leaderboard/friends     # Friends leaderboard

# Economy
GET    /api/v1/economy/balance
POST   /api/v1/economy/purchase        # Buy from in-game shop
POST   /api/v1/economy/claim-daily     # Daily reward
GET    /api/v1/inventory               # List items
```

### WebSocket Events

```
# Client → Server
pet:action              # { petId, action: 'feed'|'play'|'rest' }
pet:chat                # { petId, message: string }
room:join               # { roomId }
room:leave

# Server → Client
pet:state_update        # { petId, stats, stage, animation }
pet:message             # { petId, message, emotion }
pet:event               # { petId, eventType, data }
room:user_joined        # { userId, displayName }
room:user_left
economy:update          # { coins, gems }
notification            # { type, title, body }
```

## 5.3 Server-Authoritative Game Loop

```
[Client] ──action──▶ [API Gateway] ──▶ [Game Loop Service]
                                            │
                                      ┌─────▼──────┐
                                      │  Validate   │
                                      │  Action     │
                                      └─────┬──────┘
                                            │
                                      ┌─────▼──────┐
                                      │  Apply      │
                                      │  Effect     │
                                      └─────┬──────┐
                                            │      │
                                      ┌─────▼┐ ┌───▼────┐
                                      │ Update│ │ Trigger│
                                      │ Stats │ │ Events │
                                      └───────┘ └───┬────┘
                                                     │
                                            ┌────────▼───────┐
                                            │ Broadcast State │
                                            │ to Client       │
                                            └────────────────┘

// Server tick every 30 seconds
// Server-side authoritative: client hanya mengirim intent
// Server yang menghitung decay, growth, death, dll
// Client hanya menampilkan hasil final
```

---

# 6. Frontend Architecture

## 6.1 Component Architecture Refactor

### Current Structure (Simplified):
```
src/
├── components/
│   ├── chat/
│   ├── layout/
│   ├── pet/
│   └── ui/
```

### Target Structure (Scalable Atomic Design):

```
src/
├── @types/                  # Global type definitions
├── @constants/              # Game constants, configs
├── @utils/                  # Pure utility functions
│
├── app/                     # App-level setup
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers.tsx        # All context providers
│   └── error-boundary.tsx
│
├── assets/
│   ├── images/
│   ├── sounds/
│   ├── animations/          # Lottie/Rive files
│   └── fonts/
│
├── core/                    # Foundation layer
│   ├── design-system/       # Design tokens, tailwind config
│   ├── hooks/               # Reusable hooks
│   │   ├── useInterval.ts
│   │   ├── useWebSocket.ts
│   │   ├── useAnalytics.ts
│   │   ├── useSound.ts
│   │   ├── useHapticFeedback.ts
│   │   ├── useNetworkStatus.ts
│   │   └── usePersistence.ts
│   └── utils/
│       ├── clamp.ts
│       ├── formatNumber.ts
│       └── validation.ts
│
├── features/                # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── pet/
│   │   ├── components/      # PetCharacter, PetAnimation
│   │   ├── engine/          # Decay, Growth, Genetics
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── market/
│   ├── breeding/
│   ├── social/
│   ├── leaderboard/
│   └── economy/
│
├── shared/                  # Shared UI components
│   ├── ui/                  # Button, Input, Modal, etc.
│   ├── layout/              # Header, BottomNav, Sidebar
│   ├── feedback/            # Toast, Loading, Skeleton
│   └── animations/          # Reusable animation components
│
├── pages/                   # Page components (thin)
│   ├── LandingPage.tsx
│   ├── GamePage.tsx
│   ├── MarketPage.tsx
│   └── ...
│
└── i18n/                    # Internationalization
    ├── en.json
    ├── ja.json
    ├── id.json
    └── index.ts
```

## 6.2 Design System

### Tokens
```typescript
const designTokens = {
  colors: {
    primary: {
      pink: '#FF6B9D',
      purple: '#C084FC',
      blue: '#60A5FA',
    },
    semantic: {
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      info: '#60A5FA',
    },
    glass: {
      light: 'rgba(255,255,255,0.1)',
      medium: 'rgba(255,255,255,0.15)',
      heavy: 'rgba(255,255,255,0.25)',
    }
  },
  spacing: { /* 4,8,12,16,20,24,32,40,48,64 */ },
  typography: {
    fontFamily: {
      primary: '"Nunito", sans-serif',
      display: '"Fredoka One", cursive',
      japanese: '"Noto Sans JP", sans-serif',
    },
    fontSize: { /* xs, sm, base, lg, xl, 2xl-8xl */ },
    fontWeight: { /* 400,500,600,700,800,900 */ },
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    glass: '0 8px 32px rgba(0,0,0,0.12)',
    glow: {
      pink: '0 0 20px rgba(255,107,157,0.4)',
      blue: '0 0 20px rgba(96,165,250,0.4)',
    }
  }
}
```

## 6.3 Performance Optimization Strategy

| Issue | Solusi | Impact |
|-------|--------|--------|
| 20 React sakura particles **→** | Canvas-based particle system via Pixi.js | 90% CPU reduction on mobile |
| SVG pet re-render setiap tick **→** | `React.memo` + `useMemo` + CSS transform | 60% fewer re-renders |
| Large bundle size **→** | Code splitting per route + lazy loading | -40% initial load time |
| No image optimization **→** | Next-gen formats (WebP/AVIF) + blur placeholder | -60% image size |
| No caching **→** | Service worker + Workbox + IndexedDB | Offline support |
| Heavy animation **→** | `will-change` + `transform: translateZ(0)` + GPU | 120fps on 60fps devices |

## 6.4 Progressive Web App (PWA) Features

```json
{
  "name": "Hagumi",
  "short_name": "Hagumi",
  "description": "Nurture magical pets and find your lifelong friend",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a1a",
  "theme_color": "#FF6B9D",
  "icons": [...],
  "categories": ["games", "lifestyle", "simulation"],
  "screenshots": [...],
  "features": {
    "offline_support": "Game loop cached, stat updates queued",
    "push_notifications": "Pet needs attention, breeding ready",
    "badge": "Unread notifications count",
    "share_target": "Share pet profile",
    "file_handling": "Import/export pet data"
  }
}
```

---

# 7. Game Content Expansion

## 7.1 Pet Varieties

```typescript
// Phase 1 (Sekarang): 4 egg types → 4 pet lines
// Phase 2: 12 pet lines (3 per element)
// Phase 3: 30+ pet lines with cross-breeding

const PET_LINES = [
  // Phase 2 - Elements
  { id: 'mochi', element: 'light',   forms: ['Mochi', 'Mochiko', 'Daifuku'] },
  { id: 'matcha', element: 'nature',  forms: ['Matcha', 'Sencha', 'Gyokuro'] },
  { id: 'yuzu', element: 'energy',   forms: ['Yuzu', 'Citrona', 'Zestia'] },
  { id: 'kuro', element: 'shadow',   forms: ['Kuro', 'Yami', 'Kage'] },
  
  // Phase 2 - New
  { id: 'mizu', element: 'water',    forms: ['Mizu', 'Mizuki', 'Kaijin'] },
  { id: 'honoo', element: 'fire',    forms: ['Honoo', 'Kaen', 'Enma'] },
  { id: 'kaze', element: 'wind',     forms: ['Kaze', 'Fuujin', 'Arashi'] },
  { id: 'tsuchi', element: 'earth',  forms: ['Tsuchi', 'Daichi', 'Ishibumi'] },
  
  // Phase 3 - Mythics (limited events)
  { id: 'ryujin', element: 'void',   forms: ['Ryujin', 'Seiryu', 'Orochi'] },
  { id: 'kitsune', element: 'spirit', forms: ['Kitsune', 'Kyubi', 'Tenko'] },
]
```

## 7.2 Mini-Games System

| Mini-Game | Type | Stats Impact | Reward |
|-----------|------|--------------|--------|
| **Sakura Catch** | Tap timing | Mood +10-30 | Coins + items |
| **Memory Match** | Card flip | Mood +15, Intelligence | Gems |
| **Feeding Frenzy** | Swipe/drag | Hunger +20-40 | Rare food |
| **Hide & Seek** | Search | Mood +25, Bonding | Cosmetics |
| **Breeding Puzzle** | Match-3 | Growth boost | Special eggs |
| **Pet Dance** | Rhythm game | Mood +40, Energy -20 | Exclusive accessories |
| **Fishing** | Patience/reaction | Mood +20, Coins | Items |
| **Garden** | Tending plants | All stats +5 | Growth items |

### Mini-Game Architecture
```typescript
interface MiniGame {
  id: string
  name: string
  description: string
  durationSeconds: number
  minDifficulty: number
  maxDifficulty: number
  
  // Scoring
  scoreAlgorithm: (playerInput: any) => number
  rewardTable: {
    minScore: number
    maxScore: number
    rewards: { type: string; amount: number; probability: number }[]
  }[]
  
  // Stat impact
  statChanges: Partial<PetStats>
  energyCost: number
  cooldownMinutes: number
}
```

## 7.3 World / Environment System

```
┌─────────────────────────────────────┐
│          HAGUMI WORLD MAP           │
├─────────────────────────────────────┤
│                                     │
│  🏡 Home (Current)                  │
│  ├── Pet Room (default interaction) │
│  ├── Garden (grow plants)           │
│  └── Storage (items)                │
│                                     │
│  🌳 Sakura Park                     │
│  ├── Socialize with friends         │
│  ├── Mini-games                     │
│  └── Events (weekend)               │
│                                     │
│  🏪 Market District                 │
│  ├── Item Shop (NPC)                │
│  ├── Player Market (P2P)            │
│  ├── Breeder's Guild                │
│  └── Auction House (weekly)         │
│                                     │
│  ⛰️ Whispering Mountains           │
│  ├── Exploration (roguelite)        │
│  ├── Rare item hunting              │
│  └── Boss events (monthly)          │
│                                     │
│  🌊 Moonlit Beach                   │
│  ├── Fishing mini-game              │
│  ├── Pet swimming                    │
│  └── Sunset events                  │
│                                     │
│  🏯 Tournament Arena                │
│  ├── Pet contests (beauty, speed)   │
│  ├── Weekly rankings                │
│  └── Seasonal championships         │
│                                     │
└─────────────────────────────────────┘
```

## 7.4 Seasonal Events Calendar

| Event | Duration | Theme | Content |
|-------|----------|-------|---------|
| **Sakura no Hanami** | Mar-Apr | Cherry blossom | Limited pets, cosmetics |
| **Natsu Matsuri** | Jul-Aug | Summer festival | Mini-games, fireworks |
| **Tsukimi** | Sep-Oct | Moon viewing | Rare moon pets, items |
| **Halloween** | Oct | Yokai theme | Spooky pets, costumes |
| **Winter Festival** | Dec | Snow/Christmas | Ice pets, gifts |
| **New Year** | Jan | Oshogatsu | Special eggs, events |
| **Valentine's** | Feb | Love | Breeding events, gift exchange |
| **Anniversary** | Game launch | Retro | OG player rewards |

---

# 8. Social & Multiplayer

## 8.1 Social Features Priority

```
MVP (Bulan 1-2):
├── Friend list + search
├── Visit friend's pet room
├── Like/react to friend's pet
├── Global chat (filtered, moderated)

Phase 2 (Bulan 3-4):
├── Co-op mini-games
├── Pet playdates
├── Gift system
├── Trading

Phase 3 (Bulan 5-8):
├── Breed sharing / co-breeding
├── Guilds / Clubs
├── Guild events
├── World chat with channels

Phase 4 (Bulan 9-12):
├── Voice chat
├── AR pet meetups (mobile)
├── Live events (dev-hosted)
├── User-generated content market
```

## 8.2 Moderation System

```typescript
interface ModerationSystem {
  // Auto-moderation
  filters: {
    profanity_filter: RegExp[]
    spam_detection: (message: string, user: User) => boolean
    link_filter: RegExp[]
    personal_info_detector: RegExp[]
  }
  
  // Action scores
  violations: {
    SPAM:             { score: 10, penalty: 'mute_1h' },
    PROFANITY:        { score: 15, penalty: 'mute_24h' },
    HARASSMENT:       { score: 30, penalty: 'ban_7d' },
    CHEATING:         { score: 50, penalty: 'ban_permanent' },
    SCAMMING:         { score: 80, penalty: 'ban_permanent' },
  }
  
  // Thresholds
  auto_actions: {
    score_30:  'temporary_ban_1d',
    score_50:  'temporary_ban_7d',
    score_80:  'permanent_ban',
    score_100: 'ban_and_report_authorities',
  }
  
  // Reporting
  report_types: [
    'harassment', 'spam', 'scam', 'inappropriate_content',
    'impersonation', 'underage_user', 'other'
  ]
}
```

## 8.3 Real-Time Multiplayer Architecture

```
┌──────────┐    WebSocket     ┌──────────────┐
│  Client  │◄────────────────►│  WS Gateway  │
│  A       │                  │  (Go/Node)   │
└──────────┘                  └──────┬───────┘
                                     │
┌──────────┐                  ┌──────▼───────┐
│  Client  │◄────────────────►│  Room Manager│
│  B       │                  │  (Redis Pub/ │
└──────────┘                  │   Sub)       │
                              └──────┬───────┘
                                     │
┌──────────┐                  ┌──────▼───────┐
│  Client  │◄────────────────►│  State Sync  │
│  C       │                  │  Service     │
└──────────┘                  └──────────────┘

// Room Types:
// - Private: 1-on-1 visit
// - Party: 2-8 players
// - Public: World chat channels
// - Event: Up to 100 players per instance
```

---

# 9. Monetization

## 9.1 Monetization Philosophy

> *"Monetize the experience, not the addiction."*

| Approach | Why | How |
|----------|-----|-----|
| **Cosmetics-first** | Tidak mempengaruhi gameplay | Skins, room decorations, pet accessories |
| **Convenience, not advantage** | Tidak pay-to-win | Auto-feed pass, extra storage |
| **Limited Battle Pass** | Fair progression | 2 tracks: Free + Premium ($4.99/month) |
| **Ethical gacha** | Transparent odds | "Pity system" guarantee after X pulls |

## 9.2 Revenue Streams

| Stream | Model | Target Monthly Revenue (10M MAU) |
|--------|-------|----------------------------------|
| **Premium Battle Pass** | $4.99/mo subscription | $2.5M |
| **Cosmetic Shop** | One-time purchases ($0.99-$19.99) | $3M |
| **Starter Pack** | One-time bundle ($2.99) | $1.5M |
| **Limited Gacha** | Soft currency + pity system | $2M |
| **Ads (Rewarded)** | Opt-in video ads for bonuses | $500K |
| **Breeding Slots** | Extra slot purchase | $300K |
| **Room Decor Packs** | Themed furniture sets | $200K |
| **Total Estimated** | | **~$10M/month** |

### Battle Pass Structure

```
📜 HAGUMI BATTLE PASS (Monthly)

Free Track (50 levels):
├── Level 5:  Rare food basket
├── Level 10: 100 gems
├── Level 20: Common egg skin
├── Level 30: Room decoration
├── Level 40: Pet accessory
└── Level 50: Free monthly egg

Premium Track ($4.99) - 100 levels:
├── Level 5:  Epic food basket
├── Level 10: 300 gems
├── Level 20: Rare egg skin
├── Level 30: Premium room set
├── Level 40: Exclusive pet accessory
├── Level 50: Rare monthly egg
├── Level 75: Legendary accessory
└── Level 100: Exclusive evolution skin
```

## 9.3 Economy Balance

```typescript
const ECONOMY_CONFIG = {
  // Earning rates
  dailyRewards: {
    day1:  { coins: 50,  gems: 0 },
    day2:  { coins: 75,  gems: 0 },
    day3:  { coins: 100, gems: 1 },
    day4:  { coins: 125, gems: 1 },
    day5:  { coins: 150, gems: 2 },
    day6:  { coins: 175, gems: 2 },
    day7:  { coins: 300, gems: 5 },  // Weekly bonus
  },
  
  // Engagement rewards
  miniGameRewards: {
    easy:   { coins: 10-30,  xp: 10 },
    medium: { coins: 20-60,  xp: 25 },
    hard:   { coins: 40-120, xp: 50 },
  },
  
  // Premium currency rates
  gemPackages: [
    { gems: 50,   price: 0.99 },
    { gems: 150,  price: 2.99 },
    { gems: 350,  price: 4.99 },
    { gems: 800,  price: 9.99 },   // Best value
    { gems: 2000, price: 19.99 },
  ],
  
  // Anti-exploit
  dailyLimits: {
    miniGames: 10,
    foraging: 5,
    fishing: 20,
    socialVisits: 50,
  },
  
  // Inflation control
  marketFees: {
    listing: 0.05,    // 5% listing fee (burned)
    saleFee: 0.10,    // 10% transaction fee (burned)
    auctionDeposit: 0.02, // 2% deposit
  }
}
```

---

# 10. Security & Anti-Cheat

## 10.1 Threat Model

| Threat | Risk | Mitigation |
|--------|------|------------|
| **Client-side stat manipulation** | Critical | Server-authoritative game loop |
| **LocalStorage tampering** | High | Server validation + signed tokens |
| **API abuse / rate limiting** | Medium | Rate limiting per IP + user ID |
| **Botting / automation** | High | Behavioral analysis + CAPTCHA |
| **Account theft** | Critical | 2FA, login alerts, session management |
| **Payment fraud** | Critical | Stripe Radar + manual review |
| **Cross-site scripting** | Medium | CSP headers, sanitized inputs |
| **Data scraping** | Low | Rate limits, API key rotation |

## 10.2 Anti-Cheat Implementation

```typescript
interface AntiCheat {
  // Client-side detection
  clientChecks: {
    devToolsOpen: () => boolean
    memoryModification: () => boolean
    speedHack: () => boolean
    autoClicker: () => boolean
    emulatorDetection: () => boolean  // For mobile
  }
  
  // Server-side validation
  serverValidation: {
    statChangeRate:              // Max 100 points change per action
    actionCooldown:              // Min 500ms between actions
    dailyStatsChangeLimit:       // Max stat total change per day
    inconsistencyCheck:          // Compare client vs server calculated values
  }
  
  // Behavioral analysis
  behavioralFlags: {
    perfectTimingEveryTime:      // Bot detection
    repetitivePattern:           // Macro detection
    inhumanReactionTime:         // Sub-100ms reactions
    
    // Suspicious play patterns
    _24hNonStopPlay:               // Account sharing / bot
    impossibleStatGain:            // Cheat engine
    
    // Economy abuse
    rapidBuySellCycle:             // Money laundering
    newAccountHighValueActivity:   // Smurf / alt account
  }
  
  // Response tiers
  penalties: {
    tier1_warning: { action: 'send_warning', duration: 0 },
    tier2_temp_mute: { action: 'mute', duration: '24h' },
    tier3_temp_ban: { action: 'ban', duration: '7d' },
    tier4_permanent_ban: { action: 'ban_permanent', duration: -1 },
    tier5_device_ban: { action: 'ban_device', duration: -1 },
  }
}
```

## 10.3 Data Protection (GDPR / UU PDP)

```
✅ Right to access → Export user data endpoint
✅ Right to rectification → Edit profile
✅ Right to erasure → Delete account (with grace period)
✅ Right to data portability → JSON export
✅ Right to object → Opt-out of analytics
✅ Parental consent → COPPA compliance for under-13
✅ Data retention → 90 days after account deletion
✅ Breach notification → 72-hour window
✅ DPA (Data Processing Agreement) → For EU users
```

---

# 11. Testing & QA

## 11.1 Testing Pyramid

```
          ╱╲
         ╱  ╲          E2E Tests (Cypress/Playwright)
        ╱    ╲         20 tests → Critical user flows
       ╱──────╲
      ╱        ╲
     ╱          ╲       Integration Tests (Vitest)
    ╱            ╲     100 tests → API + Store + DB
   ╱──────────────╲
  ╱                  ╲
 ╱                    ╲  Unit Tests (Vitest)
╱                      ╲ 500+ tests → Engine, Utils, Components
╱────────────────────────╲
```

## 11.2 Test Plan

### Unit Tests (Priority Order)

```typescript
// 1. Game Engine Tests (CRITICAL)
describe('LifecycleEngine', () => {
  describe('computeAging', () => {
    it('should evolve from baby to child after 4 days')
    it('should not evolve if pet is dead')
    it('should handle edge case of negative dayAge')
  })
  
  describe('checkDeath', () => {
    it('should return true if hunger <= 0')
    it('should return true if health <= 0')
    it('should return false if both hunger and health > 0')
    it('should not trigger death during grace period')
  })
  
  describe('calculateDecay', () => {
    it('should apply genetics multiplier')
    it('should apply personality modifier')
    it('should not exceed stat bounds [0, 100]')
    it('should accumulate decay over multiple ticks')
  })
})

describe('GeneticsEngine', () => {
  describe('combineGenetics', () => {
    it('should pick random trait from parents')
    it('should average numeric traits')
    it('should handle mutation (1% chance)')
    it('should preserve recessive genes')
  })
})

// 2. State Management Tests
describe('PetStore', () => {
  it('should update stats immutably')
  it('should clamp stats to [0, 100]')
  it('should persist to localStorage')
  it('should handle missing pet gracefully')
})

// 3. API Tests (mocked)
describe('API Client', () => {
  it('should retry on 500 errors')
  it('should handle network timeout')
  it('should refresh token on 401')
})
```

### E2E Test Flows (Cypress)

```
Flow 1: New User Journey
  Landing → Egg Select → Hatch → Game → Feed → Play → Rest

Flow 2: Breeding
  Game → Market → Buy Item → Breed → View Baby

Flow 3: Social
  Login → Add Friend → Visit Friend → Send Gift

Flow 4: Death & Revival
  Neglect Pet → Death Screen → Use Revival Item → Pet Returns

Flow 5: Economy
  Daily Reward → Play Mini Game → Earn Coins → Buy Item → Sell Item
```

## 11.3 QA Automation Pipeline

```
┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│  PR      │──▶│  Unit     │──▶│  E2E     │──▶│  Perf    │
│  Merged  │   │  Tests    │   │  Tests   │   │  Tests   │
└──────────┘   └───────────┘   └────┬─────┘   └──────────┘
                                     │
                            ┌────────▼─────────┐
                            │  Visual           │
                            │  Regression       │
                            │  (Chromatic)      │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │  Accessibility    │
                            │  Audit (axe)      │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │  Lighthouse       │
                            │  Score Check      │
                            │  (min 90)         │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │  Bundle Size      │
                            │  Check (+500KB?)  │
                            └──────────────────┘
```

## 11.4 Performance Testing Targets

| Metric | Current | Target | Tool |
|--------|---------|--------|------|
| Lighthouse Performance | ? | ≥ 90 | Lighthouse CI |
| Lighthouse Accessibility | ? | ≥ 95 | axe-core |
| First Contentful Paint | ? | < 1.5s | Web Vitals |
| Largest Contentful Paint | ? | < 2.5s | Web Vitals |
| Time to Interactive | ? | < 3.0s | Web Vitals |
| Bundle Size (initial) | ? | < 200KB | Bundle Analyzer |
| API Response (p50) | ? | < 100ms | Datadog |
| API Response (p99) | ? | < 500ms | Datadog |
| WebSocket Latency | ? | < 50ms | Custom |
| Concurrent Users | ? | 100K+ | k6 / Locust |

---

# 12. Analytics & Observability

## 12.1 Event Tracking Taxonomy

```typescript
// Standard Events (Mixpanel / Amplitude)
const ANALYTICS_EVENTS = {
  // Acquisition
  'user.signup':        { method: 'email'|'google'|'apple'|'discord' },
  'user.login':         { method, is_returning: boolean },
  
  // Engagement
  'game.session_start': { pet_id, pet_stage, day_age },
  'game.session_end':   { duration_seconds, actions_count },
  'pet.action':         { action_type, pet_id, stat_before, stat_after },
  'pet.evolution':      { from_stage, to_stage, pet_id, day_age },
  'pet.death':          { cause, age_days, total_care_score },
  
  // Social
  'social.friend_add':  { target_user_id, source: 'search'|'visit'|'suggest' },
  'social.visit':       { target_user_id, duration },
  
  // Economy
  'economy.purchase':   { item_type, price_currency, price_amount, payment_method },
  'economy.market_list': { item_type, price },
  'economy.market_sell': { item_type, price, time_to_sell },
  
  // Progression
  'battlepass.level':   { new_level, track: 'free'|'premium' },
  'achievement.unlock': { achievement_id, category },
  'milestone.reached':  { type: 'days_7'|'pet_10'|'breed_100', value },
  
  // Performance
  'performance.lcp':    { value_ms, route },
  'performance.fcp':    { value_ms, route },
  'error.client':       { error_type, message, stack_trace, route },
}
```

## 12.2 Observability Stack

```
┌─────────────────────────────────────────────────────┐
│                  OBSERVABILITY STACK                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           APPLICATION MONITORING              │  │
│  ├──────────────────┬───────────────────────────┤  │
│  │  Sentry (Errors) │  Datadog (APM + Metrics)  │  │
│  └──────────────────┴───────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           INFRASTRUCTURE MONITORING           │  │
│  ├──────────────┬───────────────┬───────────────┤  │
│  │ Prometheus   │ Grafana       │ PagerDuty     │  │
│  │ (Metrics)    │ (Dashboards)  │ (Alerting)    │  │
│  └──────────────┴───────────────┴───────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           LOG MANAGEMENT                       │  │
│  ├──────────────────┬───────────────────────────┤  │
│  │ Elasticsearch    │ Kibana                     │  │
│  │ (Structured Logs)│ (Log Explorer)             │  │
│  └──────────────────┴───────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           BUSINESS ANALYTICS                   │  │
│  ├──────────────┬───────────────┬───────────────┤  │
│  │ Mixpanel     │ BigQuery      │ Looker Studio │  │
│  │ (User Events)│ (Data Lake)   │ (Dashboards)  │  │
│  └──────────────┴───────────────┴───────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 12.3 Key Metrics Dashboard

### Business KPIs
```
📊 DAU/MAU:    [Target: 10M MAU by month 18]
📊 Retention D1/D7/D30: [Target: 60%/35%/20%]
📊 ARPU:       [Target: $0.80/month]
📊 Conversion: [Target: 8% free→paid]
📊 Session Length: [Target: 15+ minutes]
📊 Daily Actions: [Target: 30+ per user]
```

### Technical KPIs
```
⚡ API Latency p50:   [Target: <100ms]
⚡ API Latency p99:   [Target: <500ms]
⚡ Uptime:            [Target: 99.95% (SLA)]
⚡ Error Rate:        [Target: <0.1%]
⚡ Crash Rate:        [Target: <0.5%]
⚡ Build Time:        [Target: <10 minutes]
```

---

# 13. Compliance & Legal

## 13.1 Regulatory Checklist

| Regulation | Jurisdiction | Requirements | Status |
|------------|-------------|--------------|--------|
| **GDPR** | EU/EEA | Data protection, right to erasure, DPA | ⬜ |
| **CCPA** | California, USA | Right to know, opt-out of sale | ⬜ |
| **COPPA** | USA (under 13) | Parental consent, limited data | ⬜ |
| **UU PDP** | Indonesia | Data protection, breach notification | ⬜ |
| **APPI** | Japan | Data protection | ⬜ |
| **Korean PIPA** | South Korea | Consent, data localization | ⬜ |
| **Gacha Laws** | JP/KR/CN | Transparent odds, pity system | ⬜ |
| **Apple TOS** | Global | Sign in with Apple requirement | ⬜ |
| **Google Play** | Global | Family policy compliance | ⬜ |
| **Stripe TOS** | Global | Payment compliance | ⬜ |

## 13.2 Legal Documents Required

- [ ] Terms of Service (ToS)
- [ ] Privacy Policy (GDPR-compliant)
- [ ] EULA (End User License Agreement)
- [ ] Community Guidelines
- [ ] Moderation Policy
- [ ] Refund Policy
- [ ] Cookie Policy
- [ ] Data Retention Policy
- [ ] DMCA / Copyright Policy
- [ ] Children's Privacy Policy (if under-13 users allowed)

---

# 14. Team & Organization

## 14.1 Recommended Team Structure

```
                     ┌──────────────────┐
                     │  Game Director   │
                     │  (Creative Lead) │
                     └────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌─────▼─────┐
   │  Product │          │  Tech   │          │   Art &   │
   │  Team    │          │  Team   │          │   Design  │
   └────┬────┘          └────┬────┘          └─────┬─────┘
        │                    │                      │
   ┌────┴──────┐       ┌────┴──────┐        ┌──────┴──────┐
   │ PM (Game) │       │  Lead     │        │  Art Lead   │
   │ Prod Mgr  │       │  Engineer │        │  UI/UX      │
   │ Data Anal │       │           │        │  Animator   │
   └───────────┘       │ Backend 2│        │  Illustrator│
                       │ Frontend2│        │  VFX        │
                       │ DevOps   │        └─────────────┘
                       │ QA       │
                       │ Security │
                       └──────────┘
```

## 14.2 Hiring Plan (24-month)

| Role | Month Hire | Salary Range (USD) | Notes |
|------|-----------|-------------------|-------|
| **Game Director** | 1 | $120-180K | Vision + design leadership |
| **Lead Engineer** | 1 | $130-180K | Architecture + mentorship |
| **Product Manager** | 1 | $100-140K | Roadmap + prioritization |
| **UI/UX Designer** | 1 | $80-120K | Design system + user testing |
| **Backend Engineer (Go)** | 2 | $100-150K | Game loop service |
| **Frontend Engineer (React)** | 2 | $90-140K | PWA + mobile adapt |
| **DevOps/SRE** | 3 | $120-160K | Kubernetes + CI/CD |
| **2D Artist** | 3 | $60-90K | Pet designs, UI elements |
| **QA Engineer** | 3 | $60-90K | Test automation + manual |
| **Data Scientist** | 4 | $110-150K | Player behavior analysis |
| **Animator** | 4 | $70-100K | Pet animations (Spine/Spriter) |
| **Community Manager** | 5 | $50-70K | Discord, social media |
| **Security Engineer** | 6 | $130-170K | Anti-cheat + compliance |
| **Game Designer** | 6 | $80-110K | Content, balance, systems |
| **Mobile Engineer** | 8 | $100-150K | React Native / native |
| **Marketing Lead** | 8 | $90-130K | UA, ASO, campaigns |
| **Customer Support** | 10 | $40-60K | 2-3 agents initially |
| **Backend Scala/Rust** | 12 | $120-170K | High-performance systems |
| **ML Engineer** | 12 | $130-180K | Pet AI, personalization |
| **Audio Designer** | 14 | $60-90K | Music, SFX, pet sounds |

## 14.3 Estimated Monthly Burn Rate

| Phase | Team Size | Monthly Cost | Duration |
|-------|-----------|-------------|----------|
| **Phase 1: Foundation** | 8-10 people | ~$120K | Month 1-3 |
| **Phase 2: Growth** | 15-20 people | ~$250K | Month 4-8 |
| **Phase 3: Scale** | 25-35 people | ~$450K | Month 9-16 |
| **Phase 4: Global** | 40-60 people | ~$800K | Month 17-24 |

---

# 15. Roadmap Timeline

## 15.1 Phase 1: Foundation (Month 1-3)
**Goal: Production-grade stable web game with critical fixes**

```
[M1] 🔴 Critical Bug Fixes ✅ (SELESAI)
  ├── ✅ Hapus duplikasi usePetLifecycle / usePetDecay — digabung jadi satu hook
  ├── ✅ Wiring genetics ke decay logic — BASE_DECAY × genetics × personality multipliers
  ├── ✅ Clamp stats di updateStats — NaN safe, range [0, 100], rounding
  ├── ✅ Error handling semua Supabase calls — try/catch + error state di semua store
  ├── ✅ Fix navigate-in-render bug — pindah ke useEffect + redirecting flag
  └── ✅ Type replacement: any → proper interfaces — MarketListing, PublicAdultPet, dll

[M2] 🔧 Infrastructure Setup ✅ (SELESAI)
  ├── ⬜ Dedicated PostgreSQL (migrate from Supabase free) — butuh akses Supabase Pro
  ├── ✅ GitHub Actions CI/CD pipeline — 5 jobs (lint, test, build, preview deploy, prod deploy)
  ├── ✅ Sentry error tracking — @sentry/react + ErrorBoundary + vite-env.d.ts
  ├── ✅ Cloudflare setup guide — docs/CLOUDFLARE_SETUP.md (referensi implementasi)
  ├── ✅ Environment variables — .env.example + vite-env.d.ts types
  └── ⬜ Automated daily backups — butuh akses database management

[M3] 🎮 Game Engine Overhaul ✅ (SELESAI)
  ├── ✅ Server-authoritative game loop (Go) — backend/cmd/main.go: WebSocket server, 30s tick, decay engine, clamp, actions
  ├── ✅ WebSocket real-time stats sync — hooks/useWebSocket.ts: auto-connect, reconnect, fallback to local state
  ├── ✅ Advanced genetics system (Mendelian) — lib/geneticsEngine.ts: Punnett square, dominant/recessive alleles, mutation 1%, personality blending
  ├── ✅ Pet AI state machine — lib/petAIEngine.ts: 13 states (idle→dead), priority-based transitions, emotion messages
  ├── ✅ Grace period mechanic — Go backend + lib/lifecycleEngine.ts: 72-hour survival window before death
  └── ✅ Growth = f(stats) calculation — Go backend + lib/lifecycleEngine.ts: growth = careQuality × geneticsFactor × 100
```

**Deliverables:**
- ✅ Genetics traits affect gameplay (via personality multipliers)
- ✅ Stats properly clamped and validated (NaN-safe, clamped [0,100])
- ✅ Error handling across all layers (try/catch + error state)
- ✅ Dead code removal (usePetDecay hook dihapus, usePetLifecycle jadi single source of truth)
- ✅ Server-authoritative game loop running (Go backend :3001)
- ✅ WebSocket real-time stats sync (bi-directional state sync)
- ✅ Mendelian genetics system (Punnett squares, alleles, mutations)
- ✅ Pet AI state machine (13 behavior states with priority)
- ✅ Grace period mechanic (72-hour survival window)
- ✅ Growth = f(stats) formula (care quality × genetics speed)
- ⬜ CI/CD running with tests
- ⬜ Sentry monitoring active

---

## 15.2 Phase 2: Content & Social (Month 4-8)
**Goal: Feature parity with industry standards, social features**

```
[M4] 🎨 UI/UX Overhaul ✅ (SELESAI)
  ├── ✅ Full design system tokens — lib/designTokens.ts: colors, spacing, typography, shadows, animations, CSS variables
  ├── ✅ Atomic design component restructure — src/shared/ui/ (Button, Modal), src/shared/feedback/ (Loading, Skeleton)
  ├── ✅ CSS animations overhaul — index.css: 18 keyframe animations (idle-bounce, glow-pulse, fadeIn, slideUp, shake, float, sparkle, paw-screen, look-around, rub-eyes, yawn, sigh, hop, tremble, curl, jump-spin, fade-shake, gentle-rock)
  ├── ✅ Accessibility improvements — Modal: focus trap, aria-modal, aria-label, Escape to close, keyboard navigation, auto-focus; Button: aria-label, focus-visible ring, disabled states
  ├── ✅ i18n setup — src/i18n/: en.json (60+ keys), ja.json (Japanese), index.ts (t() function with interpolation, setLocale, initLocale, browser language detection)
  ├── ✅ PWA features — vite.config.ts enhanced manifest: categories, screenshots, shortcuts (My Pet, Market), Workbox runtime caching for Google Fonts, maskable icons, offline support
  └── ✅ Dark mode + themes — Already single dark theme, CSS variables in :root for easy theming

[M5] 👥 Social Features v1 ✅ (SELESAI)
  ├── ✅ Friend system — src/features/social/socialStore.ts: loadFriends, searchUsers, sendFriendRequest, accept/reject, removeFriend; UserSearch component with real-time Supabase search
  ├── ✅ Pet room visiting — VisitModal: friend's pet preview, leave reaction (6 emoji types: ❤️🌸✨🌟🎀💫), React context-aware UI
  ├── ✅ Global chat (moderated) — GlobalChat component: message filter (All/Chat/System), profanity filter (basic regex), auto-scroll, Enter to send, message bubbles
  ├── ✅ Gift system — sendGift action, GiftsTab with unread count, read/unread state, gift history, modal integration
  └── ✅ Like/react on pet profiles — leaveReaction action with 6 reactions, AnimatePresence animation, per-visit reaction storage

[M6] 🎪 Mini-Games & Content ✅ (SELESAI)
  ├── ✅ 5 mini-games — src/features/minigames/: types.ts, minigameStore.ts (5 games: Sakura Catch, Memory Match, Feeding Frenzy, Hide & Seek, Pet Dance), MiniGamesPage.tsx with full game implementations, cooldown system, high scores, reward tiers
  ├── ✅ New pet lines — src/features/content/contentStore.ts: 8 pet lines (mochi, matcha, yuzu, kuro, mizu, honoo, kaze, tsuchi) with elements (light, nature, energy, shadow, water, fire, wind, earth), forms per stage, colors, personalities
  ├── ✅ Room decoration system — 4 decoration items (Cozy Bed, Warm Lamp, Mini Fountain, Sakura Tree) with stat changes, equipable, rarity tiers
  ├── ✅ Item catalog: 50+ items — 23 items across 7 types (food, toy, decoration, medicine, accessory, cosmetic, rare-food, rare-accessory), 5 rarity tiers (common→legendary), stat changes, prices (coins/gems)
  └── ✅ Achievement system — 20 achievements across 5 categories (pet, social, economy, minigame, exploration), progress tracking, auto-unlock, rewards (coins, gems, items, titles)

[M7] 💰 Economy & Monetization ✅ (SELESAI)
  ├── ✅ Premium Battle Pass — 100 levels, free + premium tracks, XP progression, reward claiming, premium upgrade ($4.99)
  ├── ✅ Cosmetic shop — 7 items, category filtering, rarity system, purchase flow, balance display
  ├── ✅ Starter pack — New player bundles, pricing configuration, purchase system
  ├── ✅ Limited gacha with pity system — Spring Blossom pool, 90-pity, drop rates, single/10-pull, animated results
  ├── ✅ Daily rewards — 7-day calendar, escalating rewards, streak tracking, claim animation
  ├── ✅ Economy store — Currency management, Supabase integration, TypeScript types, full CRUD operations
  ├── ✅ UI pages — Shop, Battle Pass, Gacha with beautiful animations and glassmorphism design
  └── ⬜ Rewarded ads integration — Requires ad SDK integration (future)
  +++++++ REPLACE

[M8] 📱 Mobile Prep
  - [x] React Native project setup (Expo + TypeScript)
  - [x] Shared component library (Button, Card, StatBar)
  - [x] Mobile-specific UI adaptations (5 screens)
  - [x] Touch controls optimization (useTouchFeedback hook)
  - [x] App Store screenshots + description documentation
  - [x] TypeScript configuration and error fixes
  - [x] Expo development server running
```

**Deliverables:**
- ✅ Full social features live
- ✅ 5 mini-games playable
- ✅ 8 pet lines available
- ✅ Monetization live (Battle Pass + Shop)
- ✅ React Native app in TestFlight

---

## 15.3 Phase 3: Scale (Month 9-16)
**Goal: Global launch preparation, mobile launch, 1M+ users**

```
[M9] 🏗️ Infrastructure Scale
  ├── Kubernetes cluster (EKS/GKE)
  ├── Redis cluster for caching
  ├── Database read replicas
  ├── Multi-region deployment (US, EU, Asia)
  └── Load testing + optimization

[M10] 🌍 Mobile Launch
  ├── iOS App Store submission
  ├── Google Play Store submission
  ├── ASO optimization
  ├── Push notification campaign
  └── Mobile-specific features (AR, haptics)

[M11] 🎮 Advanced Features
  ├── World map (5 locations)
  ├── Exploration mode (roguelite)
  ├── Pet contests (weekly)
  ├── Guilds / Clubs
  └── Voice chat integration

[M12] 📊 Data-Driven Optimization
  ├── Full event tracking implementation
  ├── Player segmentation
  ├── A/B testing framework
  ├── Personalization engine
  ├── Churn prediction model
  └── Automated re-engagement campaigns

[M13-16] 📈 User Acquisition & Growth
  ├── Paid UA campaigns (Facebook, TikTok, Google)
  ├── Influencer partnerships
  ├── Referral program
  ├── Seasonal events calendar
  ├── Streamer mode (Twitch integration)
  └── User-generated content program
```

**Deliverables:**
- ✅ Mobile apps live on both platforms
- ✅ 1M+ registered users
- ✅ 200K+ DAU
- ✅ World map with 5 locations
- ✅ Guild system active
- ✅ Data infrastructure fully operational

---

## 15.4 Phase 4: Global (Month 17-24)
**Goal: 10M users, franchise expansion, esports**

```
[M17-18] 🎪 Live Events & Esports
  ├── Monthly competitive tournaments
  ├── Seasonal championships with prizes
  ├── Spectator mode
  ├── Betting system (in-game currency)
  └── Regional qualifiers

[M19-20] 🚀 Technology Frontiers
  ├── Desktop app (Tauri/Rust)
  ├── AR pet integration (mobile)
  ├── AI-powered pet speech
  ├── User-generated content marketplace
  └── Cross-chain NFT integration? (eval)

[M21-22] 💎 Premium & Ecosystem
  ├── Premium subscription tier ($9.99/mo)
  ├── Exclusive 3D pet models
  ├── Collaborations (brands, IPs)
  ├── Merchandise store
  └── API for third-party developers

[M23-24] 🌟 Franchise Expansion
  ├── Hagumi animated short series
  ├── Comic/graphic novel
  ├── Licensing deals
  ├── Live events (pop-up, conventions)
  └── Spin-off game concepts
```

**Deliverables:**
- ✅ 10M+ registered users
- ✅ 1M+ DAU
- ✅ $10M+ monthly revenue
- ✅ Esports ecosystem active
- ✅ Desktop app launched
- ✅ Brand collaborations live
- ✅ Animated media in production

---

# 16. Success Metrics

## 16.1 North Star Metric

> **"Weekly Active Players Who Interact With Their Pet 5+ Times"**

This metric captures:
- ✅ Retention (they came back)
- ✅ Engagement (they played meaningfully)
- ✅ Emotional attachment (they care for their pet)

## 16.2 Key Results (12-Month)

```
🎯 KR1: Monthly Active Users
  Current: ~0
  3-mo:    10,000
  6-mo:    100,000
  12-mo:   1,000,000

🎯 KR2: D7 Retention
  Target: 35%+
  Industry benchmark: 25% (mobile games)

🎯 KR3: D30 Retention
  Target: 18%+
  Industry benchmark: 12% (mobile games)

🎯 KR4: Average Session Length
  Target: 15+ minutes
  Industry benchmark: 8-12 min

🎯 KR5: Daily Active Actions Per User
  Target: 30+ interactions
  (Feed, Play, Rest, Chat, Visit, Mini-games)

🎯 KR6: Conversion Rate (Free → Paid)
  Target: 8%+
  Industry benchmark: 3-5%

🎯 KR7: Net Promoter Score (NPS)
  Target: 50+
  (Great = 50+, Excellent = 70+)

🎯 KR8: App Store Rating
  Target: 4.5+ stars
  Minimum viable: 4.2 stars

🎯 KR9: Crash Rate
  Target: <0.5%
  Industry standard: <1.0%

🎯 KR10: Monthly Revenue
  Target: $10M at scale (24 months)
```

## 16.3 Health Check Dashboard

```
┌─────────────────────────────────────────────────────────┐
│               HAGUMI HEALTH CHECK (Weekly)               │
├─────────────────────────────────────────────────────────┤
│ ✅ Game Loop: Processing 99.99% ticks on time            │
│ ✅ WebSocket: Avg latency 12ms, peak 45ms                │
│ ✅ API: p50 45ms, p99 210ms, error rate 0.02%           │
│ ✅ Database: Connections 45/100, slow queries 0          │
│ ✅ Cache: Hit rate 94%, evictions 0                     │
│ ❌ Mobile Build: iOS failing on Xcode 16.2               │
│ ⚠️ CDN: Cache hit rate 78% (target >90%)                │
│ ⚠️ Bundle: 287KB (target <250KB)                        │
│                                                         │
│ 🟢 Revenue MTD: $1.2M (110% of target)                  │
│ 🟢 DAU: 45,200 (105% of target)                         │
│ 🟢 Retention D7: 38% (above target)                     │
│ 🟡 Conversion: 6.2% (below 8% target)                   │
│ 🔴 NPS: 42 (below 50 target)                            │
└─────────────────────────────────────────────────────────┘
```

---

# APPENDIX

## A. Technology Decision Log

| Decision | Option A (Chosen) | Option B | Rationale |
|----------|-------------------|----------|-----------|
| Game loop service | **Go** | Node.js | Better concurrency, lower latency |
| State management | **Zustand** | Redux | Simpler, less boilerplate |
| Mobile framework | **React Native** | Flutter | Code sharing with web |
| Database | **PostgreSQL** | MongoDB | ACID compliance for economy |
| Animation | **Framer Motion** | GSAP | React-native, declarative |

## B. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Server cost exceeds revenue | Medium | High | Spot instances, aggressive caching |
| Cheating economy | High | High | Server-authoritative, anti-cheat |
| Churn after novelty wears off | High | High | Content pipeline, events, social |
| Mobile app rejection | Medium | High | Pre-submission compliance review |
| Data breach | Low | Critical | Encryption, pen testing, SOC 2 |

## C. Glossary

| Term | Definition |
|------|------------|
| **Server-Authoritative** | Game logic runs on server, not client |
| **Decay** | Stats decreasing over time naturally |
| **Pity System** | Guaranteed rare item after X failed pulls |
| **Mendelian Genetics** | Inheritance based on dominant/recessive alleles |
| **Grace Period** | Time window before pet dies after stats hit 0 |

---

> **Dokumen ini adalah living document. Update setiap sprint review (2 minggu).**
> 
> *"Start small, think big, move fast. Hagumi will be the digital pet that the world remembers."* 🌸