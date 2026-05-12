package social

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/hagumi/game-loop/db"
)

// LeaderboardEntry represents a single entry in the leaderboard
type LeaderboardEntry struct {
	UserID    uuid.UUID `json:"userId"`
	Username  string    `json:"username"`
	PetName   string    `json:"petName"`
	PetStage  string    `json:"petStage"`
	Growth    float64   `json:"growth"`
	Rank      int       `json:"rank"`
}

// LeaderboardManager handles ranking and leaderboard updates
type LeaderboardManager struct {
	repo  *db.PetRepository
	redis *redis.Client
}

// NewLeaderboardManager creates a new leaderboard manager
func NewLeaderboardManager(repo *db.PetRepository, redisClient *redis.Client) *LeaderboardManager {
	return &LeaderboardManager{
		repo:  repo,
		redis: redisClient,
	}
}

// GetTopPets retrieves the top pets based on growth or level
func (m *LeaderboardManager) GetTopPets(ctx context.Context, limit int) ([]LeaderboardEntry, error) {
	// In a real system, we might use Redis ZSET for real-time ranking
	// For now, we'll fetch from database
	
	query := `
		SELECT p.user_id, u.username, p.name, p.stage, 
		       (p.day_age * 10 + p.hunger/10.0) as growth_score
		FROM pets p
		JOIN users u ON p.user_id = u.id
		WHERE p.is_active = true
		ORDER BY growth_score DESC
		LIMIT $1
	`
	
	// We'll use a raw query through the pool for simplicity in this manager
	rows, err := m.repo.GetPool().Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []LeaderboardEntry
	rank := 1
	for rows.Next() {
		var entry LeaderboardEntry
		if err := rows.Scan(&entry.UserID, &entry.Username, &entry.PetName, &entry.PetStage, &entry.Growth); err != nil {
			log.Printf("[Leaderboard] Scan error: %v", err)
			continue
		}
		entry.Rank = rank
		entries = append(entries, entry)
		rank++
	}
	
	return entries, nil
}

// UpdateRankings updates the real-time rankings in Redis (background task)
func (m *LeaderboardManager) UpdateRankings(ctx context.Context) error {
	// Implementation for Redis ZSET updates would go here
	return nil
}
