# HAGUMI-APP Architecture Documentation

> **Version:** 1.0  
> **Last Updated:** May 9, 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Database Schema](#database-schema)
7. [Security Architecture](#security-architecture)
8. [Scalability Strategy](#scalability-strategy)
9. [Deployment Architecture](#deployment-architecture)
10. [Monitoring & Observability](#monitoring--observability)

---

## System Overview

HAGUMI-APP is a real-time virtual pet game application built with a microservices-inspired architecture. The system consists of:

- **Frontend:** React-based web application with TypeScript
- **Backend:** Go-based WebSocket server for real-time game logic
- **Database:** PostgreSQL for persistent storage
- **Authentication:** Supabase Auth for user management
- **Infrastructure:** Cloudflare for CDN and edge computing

### Key Design Principles

1. **Real-time First:** WebSocket-based communication for instant game updates
2. **State Synchronization:** In-memory state with periodic database persistence
3. **Security First:** JWT authentication, input validation, and rate limiting
4. **Scalability:** Horizontal scaling with connection pooling
5. **Resilience:** Graceful degradation and error recovery

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │          │
│  │  (React)     │  │  (React Native)│   (React)     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                      CDN / EDGE LAYER                            │
├────────────────────────────┼─────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Cloudflare CDN / Workers                     │   │
│  │  - Static asset delivery                                 │   │
│  │  - Edge caching                                          │   │
│  │  - DDoS protection                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    APPLICATION LAYER                            │
├────────────────────────────┼─────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              WebSocket Game Server (Go)                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Auth       │  │   Game       │  │   Database   │   │   │
│  │  │   Middleware │  │   Engine     │  │   Sync       │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Rate       │  │   Input      │  │   Error      │   │   │
│  │  │   Limiting   │  │   Validation │  │   Handling   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
├────────────────────────────┼─────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Supabase Auth                                │   │
│  │  - User registration & login                             │   │
│  │  - JWT token generation                                   │   │
│  │  - Session management                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                      DATA LAYER                                  │
├────────────────────────────┼─────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Users      │  │   Pets       │  │   Game       │   │   │
│  │  │   Table      │  │   Table      │  │   Logs       │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Redis Cache (Optional)                      │   │
│  │  - Session storage                                        │   │
│  │  - Real-time leaderboards                                 │   │
│  │  - Temporary data                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

#### 1. Web Application (React + TypeScript)

**Location:** `src/`

**Structure:**
```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat components
│   ├── layout/         # Layout components
│   ├── pet/            # Pet-related components
│   └── ui/             # Base UI components
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── features/           # Feature modules
│   ├── content/        # Content features
│   ├── economy/        # Economy features
│   ├── minigames/      # Mini-games
│   └── social/         # Social features
├── hooks/              # Custom React hooks
│   ├── usePetLifecycle.ts
│   ├── useTimeOfDay.ts
│   └── useWebSocket.ts
├── lib/                # Utility libraries
│   ├── geneticsEngine.ts
│   ├── lifecycleEngine.ts
│   ├── petAIEngine.ts
│   └── validation.ts
├── pages/              # Page components
├── stores/             # State management
├── types/              # TypeScript types
└── shared/             # Shared utilities
    ├── error/          # Error handling
    ├── animations/     # Animations
    ├── feedback/       # User feedback
    └── ui/             # Shared UI
```

**Key Features:**
- Real-time WebSocket connection
- State management with Zustand
- Error boundaries for graceful error handling
- Internationalization (i18n) support
- Responsive design with Tailwind CSS

#### 2. Mobile Application (React Native)

**Location:** `mobile/`

**Structure:**
```
mobile/
├── src/
│   ├── components/     # Mobile-specific components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation setup
│   └── utils/          # Utility functions
└── assets/             # Mobile assets
```

---

### Backend Components

#### 1. WebSocket Game Server (Go)

**Location:** `backend/`

**Structure:**
```
backend/
├── cmd/
│   └── main.go         # Application entry point
├── auth/               # Authentication
│   ├── jwt.go          # JWT token management
│   ├── middleware.go   # Auth middleware
│   ├── refresh.go      # Token refresh
│   └── supabase.go     # Supabase integration
├── db/                 # Database layer
│   ├── connection.go   # Connection pool
│   ├── health.go       # Health checks
│   ├── pets.go         # Pet CRUD operations
│   ├── sync.go         # Data synchronization
│   └── migrations/     # Database migrations
├── errors/             # Error handling
│   ├── types.go        # Error types
│   └── handler.go      # Error handlers
├── logging/            # Logging
│   ├── interface.go    # Logger interface
│   └── logger.go       # Logger implementation
├── middleware/         # HTTP middleware
│   ├── cors.go         # CORS configuration
│   └── ratelimit.go    # Rate limiting
├── validation/         # Input validation
│   ├── validator.go   # Input validators
│   └── sanitizer.go    # Input sanitizers
└── config/             # Configuration
    └── constants.go    # Game constants
```

**Key Components:**

**Game Engine:**
- Manages pet state in memory
- Handles game tick loop (30-second intervals)
- Calculates stat decay and growth
- Manages WebSocket connections
- Broadcasts state updates

**Authentication:**
- JWT token validation
- Supabase Auth integration
- Session management
- Token refresh mechanism

**Database Layer:**
- PostgreSQL connection pooling
- CRUD operations for pets
- Periodic data synchronization
- Health checks

**Middleware:**
- CORS configuration
- Rate limiting (IP and user-based)
- Request size limiting
- Security headers

**Validation:**
- Input sanitization
- Data validation
- WebSocket message validation

---

## Data Flow

### 1. User Authentication Flow

```
User → Frontend → Supabase Auth → JWT Token → WebSocket Connection
```

**Steps:**
1. User enters credentials in frontend
2. Frontend sends request to Supabase Auth
3. Supabase validates credentials and returns JWT token
4. Frontend stores token and establishes WebSocket connection
5. Backend validates JWT token via middleware
6. Connection established for real-time updates

### 2. Game Action Flow

```
User Action → Frontend → WebSocket → Backend → Game Engine → State Update → Broadcast
```

**Steps:**
1. User performs action (feed, play, rest)
2. Frontend sends action via WebSocket
3. Backend validates and sanitizes input
4. Game engine updates pet state
5. State synchronized to database
6. Update broadcasted to all connected clients

### 3. Game Tick Flow

```
Timer → Game Engine → Calculate Decay → Update State → Broadcast → Sync to DB
```

**Steps:**
1. Timer triggers every 30 seconds
2. Game engine processes all active pets
3. Calculates stat decay based on genetics
4. Updates pet state in memory
5. Broadcasts updates to connected clients
6. Syncs state to database periodically

### 4. Data Synchronization Flow

```
In-Memory State → Sync Manager → Database → Backup/Restore
```

**Steps:**
1. Game engine maintains state in memory
2. Sync manager periodically saves to database
3. Database provides persistence
4. On server restart, state restored from database

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool | 5.x |
| Tailwind CSS | Styling | 3.x |
| Zustand | State Management | 4.x |
| React Router | Routing | 6.x |
| Supabase JS | Authentication | 2.x |
| Sentry | Error Tracking | Latest |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Go | Backend Language | 1.21+ |
| Gorilla WebSocket | WebSocket Library | Latest |
| pgx | PostgreSQL Driver | 5.x |
| golang-jwt | JWT Library | 5.x |
| Redis (Optional) | Caching | 7.x |

### Database

| Technology | Purpose | Version |
|------------|---------|---------|
| PostgreSQL | Primary Database | 15+ |
| Supabase | Auth & Database | Latest |

### Infrastructure

| Technology | Purpose | Version |
|------------|---------|---------|
| Cloudflare | CDN & Edge | Latest |
| Vercel | Frontend Hosting | Latest |
| Railway/DigitalOcean | Backend Hosting | Latest |

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Pets Table

```sql
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    stage VARCHAR(20) NOT NULL DEFAULT 'egg',
    stats JSONB NOT NULL,
    genetics JSONB NOT NULL,
    day_age INTEGER DEFAULT 0,
    born_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_id (user_id),
    INDEX idx_stage (stage)
);
```

### Game Logs Table

```sql
CREATE TABLE game_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_pet_id (pet_id),
    INDEX idx_created_at (created_at)
);
```

### Stats JSONB Structure

```json
{
  "hunger": 80,
  "mood": 75,
  "energy": 90,
  "health": 100
}
```

### Genetics JSONB Structure

```json
{
  "baseHungerRate": 1.0,
  "baseMoodRate": 1.0,
  "baseEnergyRate": 1.0,
  "growthSpeed": 1.0,
  "personality": "playful"
}
```

---

## Security Architecture

### Authentication & Authorization

**JWT Token Flow:**
1. User authenticates via Supabase
2. Supabase issues JWT token
3. Token stored in frontend (localStorage/cookie)
4. Token sent with WebSocket connection
5. Backend validates token on every request
6. Token refreshed before expiration

**Security Measures:**
- Token expiration: 24 hours
- Token refresh mechanism
- Secure token storage
- Token validation on every request

### Input Validation

**Validation Layers:**
1. Frontend validation (client-side)
2. WebSocket message validation
3. Backend input sanitization
4. Database-level constraints

**Validation Rules:**
- Pet IDs: UUID format
- Pet Names: 1-50 characters, alphanumeric
- Stats: 0-100 range
- Genetics: Valid ranges and personalities
- Actions: Whitelisted actions only

### Rate Limiting

**Rate Limits:**
- IP-based: 100 requests/minute
- User-based: 200 requests/minute
- Request size: 10MB maximum

**Implementation:**
- Token bucket algorithm
- Sliding window counter
- Per-IP and per-user limits
- Configurable limits

### CORS & Security Headers

**CORS Configuration:**
- Configurable allowed origins
- Preflight request handling
- Credentials support

**Security Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)

---

## Scalability Strategy

### Horizontal Scaling

**WebSocket Server:**
- Stateless design for easy scaling
- Connection pooling for database
- Load balancing across instances
- Session affinity for WebSocket connections

**Database:**
- Connection pooling
- Read replicas for scaling reads
- Database sharding (future)
- Caching layer with Redis

### Vertical Scaling

**Resource Optimization:**
- Efficient memory usage
- Connection pooling
- Lazy loading
- Query optimization

### Caching Strategy

**Multi-Level Caching:**
1. In-memory cache (game state)
2. Redis cache (sessions, leaderboards)
3. CDN cache (static assets)
4. Browser cache (API responses)

---

## Deployment Architecture

### Development Environment

```
Local Development
├── Frontend: Vite dev server (localhost:5173)
├── Backend: Go server (localhost:3001)
├── Database: PostgreSQL (localhost:5432)
└── Auth: Supabase (cloud)
```

### Staging Environment

```
Staging
├── Frontend: Vercel (staging.hagumi.app)
├── Backend: Railway (staging-api.hagumi.app)
├── Database: Supabase (staging)
└── CDN: Cloudflare (staging)
```

### Production Environment

```
Production
├── Frontend: Vercel (hagumi.app)
├── Backend: Railway/DigitalOcean (api.hagumi.app)
├── Database: Supabase (production)
├── CDN: Cloudflare (global)
└── Monitoring: Sentry, DataDog
```

### Deployment Pipeline

**CI/CD Pipeline:**
1. Code push to GitHub
2. Automated tests run
3. Build artifacts created
4. Deploy to staging
5. Run integration tests
6. Manual approval for production
7. Deploy to production
8. Health checks and monitoring

---

## Monitoring & Observability

### Logging

**Log Levels:**
- ERROR: Critical errors
- WARN: Warning messages
- INFO: Informational messages
- DEBUG: Debug information

**Log Format:**
```
[Timestamp] [Level] [Component] Message
```

**Example:**
```
[2026-05-09T10:30:00Z] [INFO] [GameEngine] Pet sakura: H=75 M=70 E=85 HP=100
```

### Metrics

**Key Metrics:**
- Active WebSocket connections
- Game tick duration
- Database query performance
- Error rates
- Response times

**Monitoring Tools:**
- Prometheus for metrics collection
- Grafana for visualization
- DataDog for APM

### Error Tracking

**Error Tracking:**
- Sentry for frontend errors
- Structured error logging
- Error aggregation
- Alerting on critical errors

### Health Checks

**Health Check Endpoints:**
- `/health` - Overall system health
- `/health/db` - Database health
- `/health/redis` - Redis health (if used)

**Health Check Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-05-09T10:30:00Z"
}
```

---

## Performance Optimization

### Frontend Optimization

**Code Splitting:**
- Route-based splitting
- Lazy loading components
- Dynamic imports

**Asset Optimization:**
- Image optimization
- CSS minification
- JavaScript minification
- Gzip compression

**Caching:**
- Service worker caching
- HTTP caching headers
- Local storage for user preferences

### Backend Optimization

**Database Optimization:**
- Connection pooling
- Query optimization
- Indexing strategy
- Prepared statements

**WebSocket Optimization:**
- Message batching
- Binary message compression
- Connection pooling
- Efficient serialization

---

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- Daily automated backups
- Point-in-time recovery
- Cross-region replication
- Backup retention policy (30 days)

**Code Backups:**
- Git version control
- Multiple remote repositories
- Automated deployment snapshots

### Recovery Procedures

**Database Recovery:**
1. Identify backup point
2. Restore from backup
3. Verify data integrity
4. Update application configuration
5. Monitor system health

**Application Recovery:**
1. Deploy last known good version
2. Restore configuration
3. Verify functionality
4. Monitor system health

---

## Future Enhancements

### Planned Features

1. **Advanced Genetics System**
   - Mendelian inheritance
   - Mutation algorithms
   - Breeding mechanics

2. **AI Behavior Engine**
   - State machine implementation
   - Personality-based behaviors
   - Emotion system

3. **Social Features**
   - Friend system
   - Pet visiting
   - Leaderboards
   - Social feed

4. **Economy System**
   - Virtual currency
   - In-app purchases
   - Marketplace

5. **Mini-Games**
   - Multiple game types
   - Scoring system
   - Rewards

### Architecture Improvements

1. **Microservices Migration**
   - Separate game engine service
   - Dedicated auth service
   - Economy service

2. **Event-Driven Architecture**
   - Message queue (RabbitMQ/Kafka)
   - Event sourcing
   - CQRS pattern

3. **Advanced Caching**
   - Redis cluster
   - Multi-level caching
   - Cache invalidation strategies

---

## Documentation

### Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Security Testing Guide](./SECURITY_TESTING_GUIDE.md)
- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md)
- [Data Migration Guide](./DATA_MIGRATION.md)
- [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)
- [Cloudflare Setup Guide](./CLOUDFLARE_SETUP.md)

---

## Support

For architecture-related questions:
- **Documentation:** See `/docs` directory
- **Issues:** Create an issue in the repository
- **Email:** architecture@hagumi.app