package social

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/hagumi/game-loop/db"
)

// SocialManager handles high-level social logic and coordination
type SocialManager struct {
	repo  *db.SocialRepository
	redis *redis.Client
}

// NewSocialManager creates a new social manager
func NewSocialManager(repo *db.SocialRepository, redisClient *redis.Client) *SocialManager {
	return &SocialManager{
		repo:  repo,
		redis: redisClient,
	}
}

// HandleFriendAction processes friend-related requests
func (m *SocialManager) HandleFriendAction(ctx context.Context, userID uuid.UUID, targetID uuid.UUID, action string) error {
	switch action {
	case "request":
		return m.repo.SendFriendRequest(ctx, userID, targetID)
	case "accept":
		return m.repo.AcceptFriendRequest(ctx, targetID, userID)
	default:
		return fmt.Errorf("unknown friend action: %s", action)
	}
}

// VisitPet records a pet visit and handles rewards
func (m *SocialManager) VisitPet(ctx context.Context, visitorID uuid.UUID, petID uuid.UUID, message string) error {
	// 1. Get pet details from Redis or DB
	// For now we'll assume we have the pet info
	// In a real scenario, we'd fetch the host_id from the pet_id
	
	// Mock host_id lookup (this should be replaced with real pet metadata)
	hostID := uuid.New() // Placeholder

	reward := map[string]interface{}{
		"type":   "coins",
		"amount": 10,
	}
	rewardJSON, _ := json.Marshal(reward)

	visit := &db.Visit{
		VisitorID:   visitorID,
		HostID:      hostID,
		PetID:       petID,
		Message:     message,
		RewardGiven: rewardJSON,
	}

	err := m.repo.RecordVisit(ctx, visit)
	if err != nil {
		return err
	}

	log.Printf("[Social] User %s visited pet %s", visitorID, petID)
	return nil
}

// GetFeed retrieves the social activity feed
func (m *SocialManager) GetFeed(ctx context.Context, userID uuid.UUID) ([]map[string]interface{}, error) {
	return m.repo.GetActivityFeed(ctx, userID, 50)
}
