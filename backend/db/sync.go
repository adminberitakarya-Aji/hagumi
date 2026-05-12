package db

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// SyncManager handles data synchronization between Redis and Database
type SyncManager struct {
	petRepo      *PetRepository
	redis        *redis.Client
	syncInterval time.Duration
	stopChan     chan struct{}
}

// NewSyncManager creates a new sync manager
func NewSyncManager(petRepo *PetRepository, redisClient *redis.Client, syncInterval time.Duration) *SyncManager {
	return &SyncManager{
		petRepo:      petRepo,
		redis:        redisClient,
		syncInterval: syncInterval,
		stopChan:     make(chan struct{}),
	}
}

// Start starts the automatic synchronization process
func (sm *SyncManager) Start() {
	log.Println("[Sync] Starting background database synchronization (Write-Behind)")
	
	// Start periodic sync
	ticker := time.NewTicker(sm.syncInterval)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			sm.FlushAll(context.Background())
		case <-sm.stopChan:
			log.Println("[Sync] Stopping synchronization")
			return
		}
	}
}

// Stop stops the automatic synchronization
func (sm *SyncManager) Stop() {
	close(sm.stopChan)
}

// MarkDirty marks a pet as needing synchronization to DB
func (sm *SyncManager) MarkDirty(ctx context.Context, petID string) {
	sm.redis.SAdd(ctx, "dirty_pets", petID)
}

// FlushAll flushes all dirty pets from Redis to Database
func (sm *SyncManager) FlushAll(ctx context.Context) {
	// 1. Get all dirty pet IDs
	dirtyPetIDs, err := sm.redis.SMembers(ctx, "dirty_pets").Result()
	if err != nil {
		log.Printf("[Sync] Failed to get dirty pets: %v", err)
		return
	}

	if len(dirtyPetIDs) == 0 {
		return
	}

	log.Printf("[Sync] Flushing %d dirty pets to database", len(dirtyPetIDs))

	for _, id := range dirtyPetIDs {
		// Try to acquire flush lock to ensure distributed safety
		lockKey := "lock:flush:" + id
		ok, err := sm.redis.SetNX(ctx, lockKey, "1", 10*time.Second).Result()
		if err != nil || !ok {
			continue
		}

		// Load from Redis
		stateJSON, err := sm.redis.Get(ctx, "pet_state:"+id).Result()
		if err != nil {
			sm.redis.SRem(ctx, "dirty_pets", id) // State gone, remove from dirty
			continue
		}

		var pet Pet
		if err := json.Unmarshal([]byte(stateJSON), &pet); err != nil {
			continue
		}

		// Update database
		err = sm.petRepo.Update(ctx, &pet)
		if err != nil {
			log.Printf("[Sync] Failed to update DB for pet %s: %v", id, err)
			continue
		}

		// Success: remove from dirty set
		sm.redis.SRem(ctx, "dirty_pets", id)
	}
}

// SyncPet synchronizes a single pet to database immediately
func (sm *SyncManager) SyncPet(ctx context.Context, pet *Pet) error {
	return sm.petRepo.Update(ctx, pet)
}

// GetPet retrieves a pet (from DB since in-memory cache is gone)
func (sm *SyncManager) GetPet(ctx context.Context, petID uuid.UUID) (*Pet, error) {
	return sm.petRepo.GetByID(ctx, petID)
}

// GetAllPets retrieves all pets from DB
func (sm *SyncManager) GetAllPets(ctx context.Context) ([]*Pet, error) {
	return sm.petRepo.GetAll(ctx)
}

// AddPet adds a pet to database
func (sm *SyncManager) AddPet(ctx context.Context, pet *Pet) error {
	return sm.petRepo.Create(ctx, pet)
}

// RemovePet removes a pet from database
func (sm *SyncManager) RemovePet(ctx context.Context, petID uuid.UUID) error {
	return sm.petRepo.Delete(ctx, petID)
}

// GetStats returns synchronization statistics
func (sm *SyncManager) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"mode":          "distributed-write-behind",
		"sync_interval": sm.syncInterval.String(),
	}
}