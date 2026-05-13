package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	
	"github.com/google/uuid"
	"github.com/hagumi/game-loop/auth"
	"github.com/hagumi/game-loop/config"
	"github.com/hagumi/game-loop/db"
	"github.com/hagumi/game-loop/db/migrations"
	"github.com/hagumi/game-loop/middleware"
	"github.com/hagumi/game-loop/validation"
	"github.com/hagumi/game-loop/ai"
	"github.com/hagumi/game-loop/errors"
	"github.com/hagumi/game-loop/genetics"
	"github.com/hagumi/game-loop/social"
	"github.com/hagumi/game-loop/payments"
	ws "github.com/hagumi/game-loop/websocket"
)

// ─── Types ───────────────────────────────────────────

type PetStats struct {
	Hunger int `json:"hunger"`
	Mood   int `json:"mood"`
	Energy int `json:"energy"`
	Health int `json:"health"`
}

type Pet struct {
	ID        string                   `json:"id"`
	UserID    string                   `json:"userId"`
	Name      string                   `json:"name"`
	Stage     string                   `json:"stage"`
	Stats     PetStats                 `json:"stats"`
	Genetics  genetics.ComplexGenetics `json:"genetics"`
	AIState   ai.AIStateInfo           `json:"aiState"`
	DayAge    int                      `json:"dayAge"`
	BornAt    time.Time                `json:"bornAt"`
	UpdatedAt time.Time                `json:"updatedAt"`
}

type GameAction struct {
	PetID  string `json:"petId"`
	Action string `json:"action"` // feed, play, rest
}

type WSMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// ─── Game Engine ─────────────────────────────────────

type GameEngine struct {
	mu              sync.RWMutex
	redis           *redis.Client
	wsManager       *ws.ConnectionManager
	upgrader        websocket.Upgrader

	authMiddleware  *auth.AuthMiddleware
	sessionManager  *auth.SessionManager
	validator       *validation.Validator
	sanitizer       *validation.Sanitizer
	database        *db.Database
	syncManager     *db.SyncManager
	petRepo         *db.PetRepository
	socialManager   *social.SocialManager
	paymentService  *payments.PaymentService
}

func NewGameEngine(authMiddleware *auth.AuthMiddleware, sessionManager *auth.SessionManager, database *db.Database, redisClient *redis.Client) *GameEngine {
	pool := database.GetPool()
	petRepo := db.NewPetRepository(pool)
	syncManager := db.NewSyncManager(petRepo, redisClient, config.SyncInterval)
	
	socialRepo := db.NewSocialRepository(database)
	socialManager := social.NewSocialManager(socialRepo, redisClient)
	wsManager := ws.NewConnectionManager()
	
	paymentService := payments.NewPaymentService()
	
	return &GameEngine{
		authMiddleware: authMiddleware,
		sessionManager: sessionManager,
		wsManager:      wsManager,
		validator:      validation.NewValidator(),
		sanitizer:      validation.NewSanitizer(),
		database:       database,
		redis:          redisClient,
		syncManager:    syncManager,
		petRepo:        petRepo,
		socialManager:  socialManager,
		paymentService: paymentService,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
			ReadBufferSize:  config.WSReadBufferSize,
			WriteBufferSize: config.WSWriteBufferSize,
		},
	}
}

// ─── Decay Calculation ───────────────────────────────

func (e *GameEngine) calculateDecay(pet *Pet, elapsedMinutes int) PetStats {
	pm := config.PersonalityMultipliers[pet.Genetics.Personality]
	if pm.Hunger == 0 {
		pm = config.PersonalityMultipliers[config.DefaultPersonality]
	}

	hungerDecay := config.HungerDecayBase * pet.Genetics.BaseHungerRate * pm.Hunger
	moodDecay := config.MoodDecayBase * pet.Genetics.BaseMoodRate * pm.Mood
	energyDecay := config.EnergyDecayBase * pet.Genetics.BaseEnergyRate * pm.Energy

	newStats := PetStats{
		Hunger: clamp(pet.Stats.Hunger - int(hungerDecay*float64(elapsedMinutes))),
		Mood:   clamp(pet.Stats.Mood - int(moodDecay*float64(elapsedMinutes))),
		Energy: clamp(pet.Stats.Energy - int(energyDecay*float64(elapsedMinutes))),
		Health: pet.Stats.Health,
	}

	// Starving mechanic
	if newStats.Hunger <= config.StarvingThresh {
		newStats.Health = clamp(newStats.Health - config.HealthDecay)
	}

	return newStats
}

func clamp(val int) int {
	if val < config.MinStat {
		return config.MinStat
	}
	if val > config.MaxStat {
		return config.MaxStat
	}
	return val
}

// ─── Grace Period Check ───────────────────────────────

func (e *GameEngine) isInGracePeriod(pet *Pet) bool {
	if pet.Stats.Hunger > 0 && pet.Stats.Health > 0 {
		return false
	}
	elapsed := time.Since(pet.UpdatedAt)
	return elapsed < config.GracePeriodDuration
}

func (e *GameEngine) checkDeath(pet *Pet, stats PetStats) bool {
	// If in grace period, pet can survive
	if e.isInGracePeriod(pet) {
		return false
	}
	return stats.Health <= 0 || stats.Hunger <= 0
}

// ─── Growth Formula ──────────────────────────────────

func (e *GameEngine) calculateGrowth(pet *Pet) float64 {
	avgStats := (float64(pet.Stats.Hunger) + float64(pet.Stats.Mood) +
		float64(pet.Stats.Energy) + float64(pet.Stats.Health)) / 4.0
	careFactor := avgStats / 100.0
	geneticsFactor := pet.Genetics.GrowthSpeed
	return careFactor * geneticsFactor * 100.0
}

// ─── Game Tick ───────────────────────────────────────

func (e *GameEngine) tick() {
	ctx := context.Background()
	
	// 1. Get all active pets from Redis
	activePetIDs, err := e.redis.SMembers(ctx, "active_pets").Result()
	if err != nil {
		log.Printf("[Tick] Failed to get active pets: %v", err)
		return
	}

	for _, id := range activePetIDs {
		// 2. Distributed Lock: Ensure only one server instance ticks this pet
		lockKey := "lock:tick:" + id
		ok, err := e.redis.SetNX(ctx, lockKey, "1", config.TickInterval-5*time.Second).Result()
		if err != nil || !ok {
			continue // Already being ticked by another server
		}

		// 3. Load state from Redis
		stateJSON, err := e.redis.Get(ctx, "pet_state:"+id).Result()
		if err != nil {
			log.Printf("[Tick] Pet %s state not found in Redis, skipping", id)
			e.redis.SRem(ctx, "active_pets", id) // Cleanup
			continue
		}

		var pet Pet
		if err := json.Unmarshal([]byte(stateJSON), &pet); err != nil {
			continue
		}

		if pet.Stage == config.StageEgg || pet.Stage == config.StageDead {
			continue
		}

		// 4. Decay
		newStats := e.calculateDecay(&pet, 1)

		// 5. Check Death
		if e.checkDeath(&pet, newStats) && !e.isInGracePeriod(&pet) {
			pet.Stage = config.StageDead
		}
		
		pet.Stats = newStats
		pet.UpdatedAt = time.Now()

		// 6. AI Behavior Engine Update
		aiStats := ai.PetStats{
			Hunger: pet.Stats.Hunger,
			Mood:   pet.Stats.Mood,
			Energy: pet.Stats.Energy,
			Health: pet.Stats.Health,
		}
		state := ai.DetermineState(aiStats, pet.Stage)
		pet.AIState = ai.GetStateInfo(state)

		// 7. Growth (log only for now)
		growth := e.calculateGrowth(&pet)
		log.Printf("[Tick] Pet %s: H=%d M=%d E=%d HP=%d | AI=%s | Growth=%.1f%%",
			pet.Name, pet.Stats.Hunger, pet.Stats.Mood, pet.Stats.Energy,
			pet.Stats.Health, pet.AIState.State, growth)

		// 8. Save back to Redis and mark as dirty for DB sync
		newStateJSON, err := json.Marshal(pet)
		if err != nil {
			log.Printf("[Tick] Failed to marshal pet %s: %v", id, err)
			continue
		}
		
		if err := e.redis.Set(ctx, "pet_state:"+id, newStateJSON, 24*time.Hour).Err(); err != nil {
			log.Printf("[Tick] Failed to save pet %s to Redis: %v", id, err)
			continue
		}
		
		e.syncManager.MarkDirty(ctx, id)

		// 9. Broadcast
		if err := e.broadcastPetState(&pet); err != nil {
			log.Printf("[Tick] Failed to broadcast pet %s state: %v", id, err)
		}
	}
}

func (e *GameEngine) broadcastPetState(pet *Pet) error {
	stateUpdate := map[string]interface{}{
		"type": "pet:state_update",
		"payload": map[string]interface{}{
			"petId":      pet.ID,
			"stats":      pet.Stats,
			"stage":      pet.Stage,
			"dayAge":     pet.DayAge,
			"aiState":    pet.AIState,
			"inGrace":    e.isInGracePeriod(pet),
			"updatedAt":  pet.UpdatedAt,
		},
	}

	msg, err := json.Marshal(stateUpdate)
	if err != nil {
		return errors.NewError(errors.ErrCodeInternalError, "Failed to marshal pet state")
	}

	// 1. WebSocket Broadcast via Manager
	e.wsManager.BroadcastToUser(pet.UserID, msg)

	// 2. Global Broadcast (Redis Pub/Sub) for multi-server synchronization
	if err := e.redis.Publish(context.Background(), "user_updates:"+pet.UserID, msg).Err(); err != nil {
		return errors.NewError(errors.ErrCodeDatabaseError, "Failed to publish update to Redis")
	}
	
	return nil
}

// ─── Actions ─────────────────────────────────────────

func (e *GameEngine) handleAction(petID string, action string) error {
	ctx := context.Background()
	
	// Sanitize inputs
	sanitizedPetID := e.sanitizer.SanitizeID(petID)
	sanitizedAction := e.sanitizer.SanitizeAction(action)
	
	// Load from Redis
	stateJSON, err := e.redis.Get(ctx, "pet_state:"+sanitizedPetID).Result()
	if err != nil {
		log.Printf("[Action] Pet state not found in Redis: %s", sanitizedPetID)
		return nil
	}

	var pet Pet
	if err := json.Unmarshal([]byte(stateJSON), &pet); err != nil {
		return err
	}

	switch sanitizedAction {
	case "feed":
		pet.Stats.Hunger = clamp(pet.Stats.Hunger + config.FeedHungerGain)
	case "play":
		pet.Stats.Mood = clamp(pet.Stats.Mood + config.PlayMoodGain)
		pet.Stats.Energy = clamp(pet.Stats.Energy - config.PlayEnergyCost)
	case "rest":
		pet.Stats.Energy = clamp(pet.Stats.Energy + config.RestEnergyGain)
	}

	// Update AI state after action
	aiStats := ai.PetStats{
		Hunger: pet.Stats.Hunger,
		Mood:   pet.Stats.Mood,
		Energy: pet.Stats.Energy,
		Health: pet.Stats.Health,
	}
	state := ai.DetermineState(aiStats, pet.Stage)
	pet.AIState = ai.GetStateInfo(state)

	pet.UpdatedAt = time.Now()
	
	// Save to Redis and mark as dirty
	newStateJSON, err := json.Marshal(pet)
	if err != nil {
		return errors.NewError(errors.ErrCodeInternalError, "Failed to marshal pet state")
	}
	
	if err := e.redis.Set(ctx, "pet_state:"+sanitizedPetID, newStateJSON, 24*time.Hour).Err(); err != nil {
		return errors.NewError(errors.ErrCodeDatabaseError, "Failed to save to Redis")
	}
	
	e.syncManager.MarkDirty(ctx, sanitizedPetID)
	
	return e.broadcastPetState(&pet)
}

// handleSyncRequest synchronizes the state for all pets belonging to a user
func (e *GameEngine) handleSyncRequest(ctx context.Context, userID string) error {
	uID, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewError(errors.ErrCodeInvalidInput, "Invalid user ID")
	}

	// 1. Find all pets for this user
	pets, err := e.petRepo.GetByUserID(ctx, uID)
	if err != nil {
		return errors.NewError(errors.ErrCodeDatabaseError, "Failed to fetch user pets")
	}

	for _, p := range pets {
		// Try to get latest state from Redis first (might be more recent than DB)
		stateJSON, err := e.redis.Get(ctx, "pet_state:"+p.ID.String()).Result()
		var pet Pet
		if err == nil {
			if err := json.Unmarshal([]byte(stateJSON), &pet); err != nil {
				log.Printf("[Sync] Failed to unmarshal pet %s: %v", p.ID, err)
				continue
			}
		} else {
			// Fallback to DB state
			var g genetics.ComplexGenetics
			json.Unmarshal(p.Genetics, &g)
			var a ai.AIStateInfo
			json.Unmarshal(p.AIState, &a)

			pet = Pet{
				ID:        p.ID.String(),
				UserID:    p.UserID.String(),
				Name:      p.Name,
				Stage:     p.Stage,
				Stats: PetStats{
					Hunger: p.Hunger,
					Mood:   p.Mood,
					Energy: p.Energy,
					Health: p.Health,
				},
				Genetics:  g,
				AIState:   a,
				DayAge:    p.DayAge,
				BornAt:    p.BornAt,
				UpdatedAt: p.UpdatedAt,
			}
		}

		// Broadcast current state to user
		e.broadcastPetState(&pet)
	}

	return nil
}

// ─── WebSocket ───────────────────────────────────────

// ─── WebSocket ───────────────────────────────────────

// broadcastState is deprecated, use broadcastPetState instead
func (e *GameEngine) broadcastState(petID string) {
	ctx := context.Background()
	stateJSON, err := e.redis.Get(ctx, "pet_state:"+petID).Result()
	if err != nil {
		return
	}
	var pet Pet
	json.Unmarshal([]byte(stateJSON), &pet)
	e.broadcastPetState(&pet)
}

func (e *GameEngine) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Authenticate WebSocket connection
	ctx, err := e.authMiddleware.AuthenticateWebSocket(r)
	if err != nil {
		log.Printf("[WS] Authentication failed: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get user ID from authenticated context
	userID, ok := auth.GetUserID(ctx)
	if !ok {
		log.Println("[WS] Failed to get user ID from context")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Upgrade to WebSocket
	conn, err := e.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("[WS] Upgrade error:", err)
		return
	}
	
	client := e.wsManager.Register(userID, conn)
	
	// Trigger immediate state synchronization for reconnection
	e.handleSyncRequest(context.Background(), userID)
	
	// Start message pumps
	go client.WritePump()
	
	// Subscribe to Redis updates
	pubsub := e.redis.Subscribe(context.Background(), "user_updates:"+userID)
	
	go func() {
		defer pubsub.Close()
		ch := pubsub.Channel()
		for msg := range ch {
			e.wsManager.BroadcastToUser(userID, []byte(msg.Payload))
		}
	}()

	client.ReadPump(func(message []byte) {
		var msg WSMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("[WS] Failed to unmarshal message: %v", err)
			e.sendWSError(userID, errors.NewError(errors.ErrCodeInvalidMessage, "Invalid message format"))
			return
		}

		// Validate WebSocket message
		if err := e.validator.ValidateWebSocketMessage(msg.Type, msg.Payload); err != nil {
			log.Printf("[WS] Invalid message: %v", err)
			e.sendWSError(userID, errors.NewError(errors.ErrCodeValidation, err.Error()))
			return
		}

		switch msg.Type {
		case "system:sync":
			if err := e.handleSyncRequest(context.Background(), userID); err != nil {
				log.Printf("[WS] Sync failed: %v", err)
				e.sendWSError(userID, err)
			}

		case "pet:action":
			var action GameAction
			if err := json.Unmarshal(msg.Payload, &action); err != nil {
				e.sendWSError(userID, errors.NewError(errors.ErrCodeInvalidInput, "Invalid action payload"))
				return
			}
			if err := e.handleAction(action.PetID, action.Action); err != nil {
				e.sendWSError(userID, err)
			}

		case "pet:register":
			var pet Pet
			if err := json.Unmarshal(msg.Payload, &pet); err != nil {
				e.sendWSError(userID, errors.NewError(errors.ErrCodeInvalidInput, "Invalid pet payload"))
				return
			}
			
			// Validate pet data
			if err := e.validator.ValidatePetName(pet.Name); err != nil {
				e.sendWSError(userID, errors.NewError(errors.ErrCodeValidation, err.Error()))
				return
			}
			
			// Initialize AI State if not present
			if pet.AIState.State == "" {
				aiStats := ai.PetStats{
					Hunger: pet.Stats.Hunger, Mood: pet.Stats.Mood,
					Energy: pet.Stats.Energy, Health: pet.Stats.Health,
				}
				pet.AIState = ai.GetStateInfo(ai.DetermineState(aiStats, pet.Stage))
			}
			
			pet.Name = e.sanitizer.SanitizePetName(pet.Name)
			pet.UpdatedAt = time.Now()
			
			stateJSON, _ := json.Marshal(pet)
			if err := e.redis.Set(context.Background(), "pet_state:"+pet.ID, stateJSON, 24*time.Hour).Err(); err != nil {
				e.sendWSError(userID, errors.NewError(errors.ErrCodeDatabaseError, "Failed to register pet in Redis"))
				return
			}
			e.redis.SAdd(context.Background(), "active_pets", pet.ID)
			
			log.Printf("[WS] Pet registered: %s (%s)", pet.Name, pet.ID)
			e.broadcastPetState(&pet)

		case "social:friend_request":
			var payload struct { TargetID string `json:"targetId"` }
			if err := json.Unmarshal(msg.Payload, &payload); err == nil {
				tID, err := uuid.Parse(payload.TargetID)
				if err != nil {
					e.sendWSError(userID, errors.NewError(errors.ErrCodeInvalidInput, "Invalid target ID"))
					return
				}
				uID, _ := uuid.Parse(userID)
				if err := e.socialManager.HandleFriendAction(context.Background(), uID, tID, "request"); err != nil {
					e.sendWSError(userID, errors.NewErrorFromError(err))
				}
			}

		case "social:visit":
			var payload struct { PetID string `json:"petId"`; Message string `json:"message"` }
			if err := json.Unmarshal(msg.Payload, &payload); err == nil {
				pID, err := uuid.Parse(payload.PetID)
				if err != nil {
					e.sendWSError(userID, errors.NewError(errors.ErrCodeInvalidInput, "Invalid pet ID"))
					return
				}
				uID, _ := uuid.Parse(userID)
				if err := e.socialManager.VisitPet(context.Background(), uID, pID, payload.Message); err != nil {
					e.sendWSError(userID, errors.NewErrorFromError(err))
				}
			}
		}
	})
}

func (e *GameEngine) sendWSError(userID string, err error) {
	appErr := errors.NewErrorFromError(err)
	errMsg := map[string]interface{}{
		"type": "system:error",
		"payload": appErr,
	}
	msg, _ := json.Marshal(errMsg)
	e.wsManager.BroadcastToUser(userID, msg)
}

// ─── Payment Handlers ─────────────────────────────────

type CreatePaymentIntentRequest struct {
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
	Gems     int    `json:"gems"`
}

func (e *GameEngine) handleCreatePaymentIntent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate user session
	userID, err := e.authMiddleware.GetUserIDFromRequest(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreatePaymentIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create payment intent with metadata
	metadata := map[string]string{
		"user_id": userID,
		"gems":    fmt.Sprintf("%d", req.Gems),
	}

	pi, err := e.paymentService.CreatePaymentIntent(req.Amount, req.Currency, metadata)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create payment intent: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"clientSecret": pi.ClientSecret,
	})
}

// ─── Main ─────────────────────────────────────────────

func main() {
	// Initialize authentication components
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key-change-in-production"
	}
	
	jwtManager := auth.NewJWTManager(jwtSecret, 24*time.Hour)
	supabaseClient := auth.NewSupabaseClient()
	authMiddleware := auth.NewAuthMiddleware(jwtManager, supabaseClient)
	sessionManager := auth.NewSessionManager(jwtManager)
	
	// Initialize database
	log.Println("[Server] Initializing database...")
	dbConfig := db.DefaultDBConfig()
	database, err := db.NewDatabase(dbConfig)
	if err != nil {
		log.Fatalf("[Server] Failed to initialize database: %v", err)
	}
	defer database.Close()
	
	// Run migrations
	log.Println("[Server] Running database migrations...")
	migrationRunner := migrations.NewRunner(database.GetPool())
	if err := migrationRunner.LoadMigrations("backend/db/migrations"); err != nil {
		log.Printf("[Server] Warning: Failed to load migrations: %v", err)
	} else {
		if err := migrationRunner.Up(context.Background()); err != nil {
			log.Fatalf("[Server] Failed to run migrations: %v", err)
		}
	}
	
	// Initialize Redis
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	log.Printf("[Server] Initializing Redis at %s...", redisURL)
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisURL,
	})
	if err := redisClient.Ping(context.Background()).Err(); err != nil {
		log.Printf("[Server] Warning: Failed to connect to Redis: %v", err)
	}
	
	// Initialize game engine with auth, database, and redis
	engine := NewGameEngine(authMiddleware, sessionManager, database, redisClient)
	
	// Start sync manager
	log.Println("[Server] Starting sync manager...")
	go engine.syncManager.Start()
	
	// Start game loop
	go func() {
		ticker := time.NewTicker(config.TickInterval)
		defer ticker.Stop()

		for range ticker.C {
			engine.tick()
		}
	}()

	// Initialize middleware
	corsConfig := middleware.DefaultCORSConfig()
	corsMiddleware := middleware.CORSMiddleware(corsConfig)
	securityMiddleware := middleware.SecurityHeadersMiddleware()
	
	// Initialize request size limiter
	requestSizeLimiter := middleware.NewRequestSizeLimiter(config.MaxRequestSize)
	
	// Create HTTP handler with middleware
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", engine.handleWebSocket)
	mux.HandleFunc("/health", database.HealthCheckHandler())
	mux.HandleFunc("/create-payment-intent", engine.handleCreatePaymentIntent)
	mux.HandleFunc("/webhooks/stripe", engine.paymentService.HandleWebhook)
	
	// Apply middleware chain
	handler := corsMiddleware(securityMiddleware(requestSizeLimiter.Middleware()(mux)))

	// Graceful shutdown
	server := &http.Server{
		Addr:    config.ServerPort,
		Handler: handler,
	}
	go func() {
		log.Println("[Server] Game loop listening on :3001")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("[Server] Error:", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[Server] Shutting down...")
	
	// Stop sync manager
	engine.syncManager.Stop()
	
	// Close database
	database.Close()
	
	ctx, cancel := context.WithTimeout(context.Background(), config.ShutdownTimeout)
	defer cancel()
	server.Shutdown(ctx)
}