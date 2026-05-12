package config

import "time"

// Game Configuration Constants
const (
	// Tick Configuration
	TickInterval = 30 * time.Second // Game tick interval (30 seconds)

	// Stat Limits
	MaxStat         = 100 // Maximum value for any stat
	MinStat         = 0   // Minimum value for any stat
	StarvingThresh  = 10  // Hunger threshold for health decay
	HealthDecay     = 2   // Health decay amount when starving

	// Grace Period Configuration
	GracePeriodDuration = 72 * time.Hour // Grace period after pet death (72 hours)

	// Action Values
	FeedHungerGain    = 20 // Hunger gain from feeding
	PlayMoodGain      = 15 // Mood gain from playing
	PlayEnergyCost    = 10 // Energy cost from playing
	RestEnergyGain    = 30 // Energy gain from resting

	// Decay Rates
	HungerDecayBase = 0.5 // Base hunger decay rate
	MoodDecayBase   = 0.3 // Base mood decay rate
	EnergyDecayBase = 0.4 // Base energy decay rate

	// WebSocket Configuration
	WSReadBufferSize  = 1024 // WebSocket read buffer size
	WSWriteBufferSize = 1024 // WebSocket write buffer size
	PingInterval      = 54 * time.Second // Ping interval
	PongWait          = 60 * time.Second // Wait time for pong response
	WriteWait         = 10 * time.Second // Time allowed to write a message


	// Rate Limiting
	IPRateLimit    = 100 // Requests per minute per IP
	UserRateLimit  = 200 // Requests per minute per user
	MaxRequestSize = 10 * 1024 * 1024 // Maximum request size (10MB)

	// Database Configuration
	DBConnectionTimeout = 10 * time.Second // Database connection timeout
	SyncInterval        = 1 * time.Minute  // Database sync interval

	// Server Configuration
	ServerPort         = ":3001" // Server port
	ShutdownTimeout    = 5 * time.Second // Graceful shutdown timeout
)

// PersonalityMultipliers defines stat decay multipliers for different personalities
var PersonalityMultipliers = map[string]struct {
	Hunger float64
	Mood   float64
	Energy float64
}{
	"playful":      {1.0, 1.3, 1.5},
	"calm":         {0.8, 0.7, 0.6},
	"energetic":    {1.3, 1.5, 1.0},
	"grumpy":       {1.0, 1.0, 1.3},
	"affectionate": {1.0, 0.9, 0.8},
	"lazy":         {0.7, 0.5, 1.1},
	"curious":      {0.9, 1.2, 0.7},
	"brave":        {1.1, 1.0, 0.5},
}

// DefaultPersonality is the fallback personality if none is specified
const DefaultPersonality = "playful"

// Pet Stages
const (
	StageEgg   = "egg"
	StageAlive = "alive"
	StageDead  = "dead"
)

// ValidActions lists all valid pet actions
var ValidActions = map[string]bool{
	"feed": true,
	"play": true,
	"rest": true,
}