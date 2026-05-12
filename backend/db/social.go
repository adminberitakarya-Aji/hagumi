package db

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// Friend represents a friendship in the database
type Friend struct {
	ID        uuid.UUID `json:"id"`
	User1ID   uuid.UUID `json:"user1Id"`
	User2ID   uuid.UUID `json:"user2Id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// SocialRepository handles social-related database operations
type SocialRepository struct {
	database *Database
}

// NewSocialRepository creates a new social repository
func NewSocialRepository(database *Database) *SocialRepository {
	return &SocialRepository{database: database}
}

// SendFriendRequest creates a pending friend request
func (r *SocialRepository) SendFriendRequest(ctx context.Context, senderID, receiverID uuid.UUID) error {
	// Ensure IDs are consistent (smaller ID first to prevent duplicates)
	u1, u2 := senderID, receiverID
	if senderID.String() > receiverID.String() {
		u1, u2 = receiverID, senderID
	}

	query := `
		INSERT INTO friends (user1_id, user2_id, status)
		VALUES ($1, $2, 'pending')
		ON CONFLICT (user1_id, user2_id) DO NOTHING
	`
	_, err := r.database.GetPool().Exec(ctx, query, u1, u2)
	return err
}

// AcceptFriendRequest updates friendship status to accepted
func (r *SocialRepository) AcceptFriendRequest(ctx context.Context, user1ID, user2ID uuid.UUID) error {
	u1, u2 := user1ID, user2ID
	if user1ID.String() > user2ID.String() {
		u1, u2 = user2ID, user1ID
	}

	query := `
		UPDATE friends 
		SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
		WHERE user1_id = $1 AND user2_id = $2 AND status = 'pending'
	`
	_, err := r.database.GetPool().Exec(ctx, query, u1, u2)
	return err
}

// GetFriends retrieves all accepted friends for a user
func (r *SocialRepository) GetFriends(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	query := `
		SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END
		FROM friends
		WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'
	`
	rows, err := r.database.GetPool().Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var friends []uuid.UUID
	for rows.Next() {
		var fID uuid.UUID
		if err := rows.Scan(&fID); err != nil {
			return nil, err
		}
		friends = append(friends, fID)
	}
	return friends, nil
}

// Visit represents a pet visit record
type Visit struct {
	ID          uuid.UUID `json:"id"`
	VisitorID   uuid.UUID `json:"visitorId"`
	HostID      uuid.UUID `json:"hostId"`
	PetID       uuid.UUID `json:"petId"`
	Message     string    `json:"message"`
	RewardGiven []byte    `json:"rewardGiven"`
	CreatedAt   time.Time `json:"createdAt"`
}

// RecordVisit saves a new visit to the database
func (r *SocialRepository) RecordVisit(ctx context.Context, visit *Visit) error {
	query := `
		INSERT INTO visits (visitor_id, host_id, pet_id, message, reward_given)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	return r.database.GetPool().QueryRow(ctx, query,
		visit.VisitorID, visit.HostID, visit.PetID, visit.Message, visit.RewardGiven,
	).Scan(&visit.ID, &visit.CreatedAt)
}

// GetActivityFeed retrieves social activity for a user and their friends
func (r *SocialRepository) GetActivityFeed(ctx context.Context, userID uuid.UUID, limit int) ([]map[string]interface{}, error) {
	query := `
		SELECT af.id, af.user_id, u.username, af.type, af.content, af.created_at
		FROM activity_feed af
		JOIN users u ON af.user_id = u.id
		WHERE af.user_id = $1 
		   OR af.user_id IN (
		       SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END
		       FROM friends
		       WHERE (user1_id = $1 OR user2_id = $1) AND status = 'accepted'
		   )
		ORDER BY af.created_at DESC
		LIMIT $2
	`
	rows, err := r.database.GetPool().Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feed []map[string]interface{}
	for rows.Next() {
		var id, uID uuid.UUID
		var username, aType string
		var content []byte
		var createdAt time.Time
		if err := rows.Scan(&id, &uID, &username, &aType, &content, &createdAt); err != nil {
			return nil, err
		}
		
		item := map[string]interface{}{
			"id":        id,
			"userId":    uID,
			"username":  username,
			"type":      aType,
			"content":   content,
			"createdAt": createdAt,
		}
		feed = append(feed, item)
	}
	return feed, nil
}
