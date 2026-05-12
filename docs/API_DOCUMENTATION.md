# HAGUMI-APP API Documentation

> **Version:** 1.0  
> **Last Updated:** May 9, 2026  
> **Base URL:** `http://localhost:3001`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [WebSocket Endpoints](#websocket-endpoints)
4. [HTTP Endpoints](#http-endpoints)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Data Models](#data-models)

---

## Overview

HAGUMI-APP uses a WebSocket-based real-time communication system for game state updates and HTTP endpoints for health checks and administrative functions.

### Protocol

- **WebSocket:** Real-time game state updates and actions
- **HTTP:** Health checks and administrative functions
- **Authentication:** JWT tokens via Supabase Auth

### Base URL

```
WebSocket: ws://localhost:3001/ws
HTTP: http://localhost:3001
```

---

## Authentication

### JWT Token Format

All WebSocket connections require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Token Structure

```json
{
  "user_id": "string",
  "email": "string",
  "exp": "number",
  "iat": "number",
  "nbf": "number"
}
```

### Token Refresh

Tokens expire after 24 hours. Use the refresh endpoint to obtain a new token.

---

## WebSocket Endpoints

### Connect to WebSocket

**Endpoint:** `ws://localhost:3001/ws`

**Method:** WebSocket Upgrade

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Establishes a real-time connection for game state updates.

**Response:** Connection established with real-time updates

---

### WebSocket Message Types

#### 1. Pet Action

**Type:** `pet:action`

**Description:** Perform an action on a pet (feed, play, rest)

**Request Payload:**
```json
{
  "petId": "string",
  "action": "feed" | "play" | "rest"
}
```

**Response:** Real-time state update via `pet:state_update`

**Example:**
```json
{
  "type": "pet:action",
  "payload": {
    "petId": "pet-123",
    "action": "feed"
  }
}
```

**Action Effects:**
- `feed`: +20 Hunger
- `play`: +15 Mood, -10 Energy
- `rest`: +30 Energy

---

#### 2. Pet Registration

**Type:** `pet:register`

**Description:** Register a new pet in the game

**Request Payload:**
```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "stage": "egg" | "alive" | "dead",
  "stats": {
    "hunger": 0-100,
    "mood": 0-100,
    "energy": 0-100,
    "health": 0-100
  },
  "genetics": {
    "baseHungerRate": 0.5-2.0,
    "baseMoodRate": 0.5-2.0,
    "baseEnergyRate": 0.5-2.0,
    "growthSpeed": 0.5-2.0,
    "personality": "playful" | "calm" | "energetic" | "grumpy" | "affectionate" | "lazy" | "curious" | "brave"
  },
  "dayAge": 0,
  "bornAt": "ISO8601 timestamp",
  "updatedAt": "ISO8601 timestamp"
}
```

**Response:** Pet registered successfully

**Example:**
```json
{
  "type": "pet:register",
  "payload": {
    "id": "pet-123",
    "userId": "user-456",
    "name": "Sakura",
    "stage": "alive",
    "stats": {
      "hunger": 80,
      "mood": 75,
      "energy": 90,
      "health": 100
    },
    "genetics": {
      "baseHungerRate": 1.0,
      "baseMoodRate": 1.0,
      "baseEnergyRate": 1.0,
      "growthSpeed": 1.0,
      "personality": "playful"
    },
    "dayAge": 1,
    "bornAt": "2026-05-09T00:00:00Z",
    "updatedAt": "2026-05-09T00:00:00Z"
  }
}
```

---

#### 3. Pet State Update (Server → Client)

**Type:** `pet:state_update`

**Description:** Real-time update of pet state (sent by server)

**Response Payload:**
```json
{
  "petId": "string",
  "stats": {
    "hunger": 0-100,
    "mood": 0-100,
    "energy": 0-100,
    "health": 0-100
  },
  "stage": "egg" | "alive" | "dead",
  "dayAge": 0,
  "inGrace": boolean,
  "updatedAt": "ISO8601 timestamp"
}
```

**Example:**
```json
{
  "type": "pet:state_update",
  "payload": {
    "petId": "pet-123",
    "stats": {
      "hunger": 75,
      "mood": 70,
      "energy": 85,
      "health": 100
    },
    "stage": "alive",
    "dayAge": 1,
    "inGrace": false,
    "updatedAt": "2026-05-09T10:30:00Z"
  }
}
```

---

## HTTP Endpoints

### Health Check

**Endpoint:** `GET /health`

**Description:** Check server and database health

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "ISO8601 timestamp"
}
```

**Status Codes:**
- `200 OK`: Server and database are healthy
- `503 Service Unavailable`: Server or database is down

---

## Error Codes

### WebSocket Errors

| Error Code | Description | HTTP Status |
|-------------|-------------|-------------|
| `AUTH_FAILED` | Invalid or expired JWT token | 401 |
| `INVALID_PET_ID` | Pet ID format is invalid | 400 |
| `INVALID_ACTION` | Action is not recognized | 400 |
| `PET_NOT_FOUND` | Pet does not exist | 404 |
| `INVALID_MESSAGE` | Message format is invalid | 400 |
| `VALIDATION_ERROR` | Data validation failed | 400 |

### HTTP Errors

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `400 Bad Request` | Invalid request parameters |
| `401 Unauthorized` | Authentication required or failed |
| `404 Not Found` | Resource not found |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Server error |
| `503 Service Unavailable` | Service temporarily unavailable |

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

**Example:**
```json
{
  "error": {
    "code": "AUTH_FAILED",
    "message": "Invalid or expired JWT token",
    "details": "Token expired at 2026-05-09T10:00:00Z"
  }
}
```

---

## Rate Limiting

### Rate Limits

- **IP-based:** 100 requests per minute
- **User-based:** 200 requests per minute
- **Request Size:** Maximum 10MB per request

### Rate Limit Headers

When rate limits are enforced, the following headers are included:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1715270400
```

### Rate Limit Error Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Data Models

### Pet

```typescript
interface Pet {
  id: string;
  userId: string;
  name: string;
  stage: 'egg' | 'alive' | 'dead';
  stats: PetStats;
  genetics: PetGenetics;
  dayAge: number;
  bornAt: string; // ISO8601 timestamp
  updatedAt: string; // ISO8601 timestamp
}
```

### PetStats

```typescript
interface PetStats {
  hunger: number; // 0-100
  mood: number; // 0-100
  energy: number; // 0-100
  health: number; // 0-100
}
```

### PetGenetics

```typescript
interface PetGenetics {
  baseHungerRate: number; // 0.5-2.0
  baseMoodRate: number; // 0.5-2.0
  baseEnergyRate: number; // 0.5-2.0
  growthSpeed: number; // 0.5-2.0
  personality: 'playful' | 'calm' | 'energetic' | 'grumpy' | 'affectionate' | 'lazy' | 'curious' | 'brave';
}
```

### Personality Multipliers

| Personality | Hunger | Mood | Energy |
|-------------|--------|------|--------|
| playful | 1.0 | 1.3 | 1.5 |
| calm | 0.8 | 0.7 | 0.6 |
| energetic | 1.3 | 1.5 | 1.0 |
| grumpy | 1.0 | 1.0 | 1.3 |
| affectionate | 1.0 | 0.9 | 0.8 |
| lazy | 0.7 | 0.5 | 1.1 |
| curious | 0.9 | 1.2 | 0.7 |
| brave | 1.1 | 1.0 | 0.5 |

---

## Game Mechanics

### Stat Decay

Stats decay every 30 seconds based on:

```
hungerDecay = 0.5 * baseHungerRate * personalityMultiplier.hunger
moodDecay = 0.3 * baseMoodRate * personalityMultiplier.mood
energyDecay = 0.4 * baseEnergyRate * personalityMultiplier.energy
```

### Starving Mechanic

When hunger ≤ 10, health decreases by 2 per tick.

### Grace Period

After a pet dies (health ≤ 0 or hunger ≤ 0), there's a 72-hour grace period where the pet can be revived.

### Growth Calculation

```
avgStats = (hunger + mood + energy + health) / 4
careFactor = avgStats / 100
growth = careFactor * growthSpeed * 100
```

---

## Security

### Input Validation

All inputs are validated and sanitized before processing:
- Pet IDs: UUID format
- Pet Names: 1-50 characters, alphanumeric and spaces
- Actions: Must be one of the valid actions
- Stats: Must be between 0-100
- Genetics: Must be within valid ranges

### CORS Configuration

Allowed origins are configured via environment variables. Default allows all origins for development.

### Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## Testing

### WebSocket Testing

Using `wscat`:

```bash
wscat -c "ws://localhost:3001/ws" -H "Authorization: Bearer <token>"
```

### HTTP Testing

Using `curl`:

```bash
curl http://localhost:3001/health
```

---

## Changelog

### Version 1.0 (May 9, 2026)
- Initial API documentation
- WebSocket endpoints for real-time game updates
- HTTP health check endpoint
- JWT authentication
- Rate limiting
- Input validation and sanitization

---

## Support

For API support and questions:
- **Documentation:** See `/docs` directory
- **Issues:** Create an issue in the repository
- **Email:** support@hagumi.app