package db

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Pet represents a pet in the database
type Pet struct {
	ID             uuid.UUID `json:"id"`
	UserID         uuid.UUID `json:"userId"`
	Name           string    `json:"name"`
	Stage          string    `json:"stage"`
	Hunger         int       `json:"hunger"`
	Mood           int       `json:"mood"`
	Energy         int       `json:"energy"`
	Health          int             `json:"health"`
	Genetics        json.RawMessage `json:"genetics"`
	AIState         json.RawMessage `json:"aiState"`
	DayAge          int             `json:"dayAge"`
	BornAt         time.Time `json:"bornAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
	IsActive       bool      `json:"isActive"`
}

// PetRepository handles pet database operations
type PetRepository struct {
	pool *pgxpool.Pool
}

// NewPetRepository creates a new pet repository
func NewPetRepository(pool *pgxpool.Pool) *PetRepository {
	return &PetRepository{pool: pool}
}

// GetPool returns the database pool
func (r *PetRepository) GetPool() *pgxpool.Pool {
	return r.pool
}


// Create creates a new pet in the database
func (r *PetRepository) Create(ctx context.Context, pet *Pet) error {
	query := `
		INSERT INTO pets (
			id, user_id, name, stage, hunger, mood, energy, health,
			complex_genetics, ai_state, day_age, born_at, is_active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, born_at, updated_at
	`

	err := r.pool.QueryRow(ctx, query,
		pet.ID,
		pet.UserID,
		pet.Name,
		pet.Stage,
		pet.Hunger,
		pet.Mood,
		pet.Energy,
		pet.Health,
		pet.Genetics,
		pet.AIState,
		pet.DayAge,
		pet.BornAt,
		pet.IsActive,
	).Scan(&pet.ID, &pet.BornAt, &pet.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create pet: %w", err)
	}

	log.Printf("[DB] Created pet: %s for user %s", pet.ID, pet.UserID)
	return nil
}

// GetByID retrieves a pet by ID
func (r *PetRepository) GetByID(ctx context.Context, id uuid.UUID) (*Pet, error) {
	query := `
		SELECT id, user_id, name, stage, hunger, mood, energy, health,
			   complex_genetics, ai_state, day_age, born_at, updated_at, is_active
		FROM pets
		WHERE id = $1 AND is_active = true
	`

	pet := &Pet{}
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&pet.ID,
		&pet.UserID,
		&pet.Name,
		&pet.Stage,
		&pet.Hunger,
		&pet.Mood,
		&pet.Energy,
		&pet.Health,
		&pet.Genetics,
		&pet.AIState,
		&pet.DayAge,
		&pet.BornAt,
		&pet.UpdatedAt,
		&pet.IsActive,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get pet: %w", err)
	}

	return pet, nil
}

// GetByUserID retrieves all pets for a user
func (r *PetRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*Pet, error) {
	query := `
		SELECT id, user_id, name, stage, hunger, mood, energy, health,
			   complex_genetics, ai_state, day_age, born_at, updated_at, is_active
		FROM pets
		WHERE user_id = $1 AND is_active = true
		ORDER BY born_at DESC
	`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get pets: %w", err)
	}
	defer rows.Close()

	var pets []*Pet
	for rows.Next() {
		pet := &Pet{}
		err := rows.Scan(
			&pet.ID,
			&pet.UserID,
			&pet.Name,
			&pet.Stage,
			&pet.Hunger,
			&pet.Mood,
			&pet.Energy,
			&pet.Health,
			&pet.Genetics,
			&pet.AIState,
			&pet.DayAge,
			&pet.BornAt,
			&pet.UpdatedAt,
			&pet.IsActive,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pet: %w", err)
		}
		pets = append(pets, pet)
	}

	return pets, nil
}

// Update updates a pet in the database
func (r *PetRepository) Update(ctx context.Context, pet *Pet) error {
	query := `
		UPDATE pets SET
			name = $2,
			stage = $3,
			hunger = $4,
			mood = $5,
			energy = $6,
			health = $7,
			day_age = $8,
			complex_genetics = $9,
			ai_state = $10,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND is_active = true
		RETURNING updated_at
	`

	err := r.pool.QueryRow(ctx, query,
		pet.ID,
		pet.Name,
		pet.Stage,
		pet.Hunger,
		pet.Mood,
		pet.Energy,
		pet.Health,
		pet.DayAge,
		pet.Genetics,
		pet.AIState,
	).Scan(&pet.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to update pet: %w", err)
	}

	log.Printf("[DB] Updated pet: %s", pet.ID)
	return nil
}

// UpdateStats updates only the stats of a pet
func (r *PetRepository) UpdateStats(ctx context.Context, id uuid.UUID, hunger, mood, energy, health int) error {
	query := `
		UPDATE pets SET
			hunger = $2,
			mood = $3,
			energy = $4,
			health = $5,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND is_active = true
	`

	result, err := r.pool.Exec(ctx, query, id, hunger, mood, energy, health)
	if err != nil {
		return fmt.Errorf("failed to update pet stats: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("pet not found: %s", id)
	}

	return nil
}

// Delete soft deletes a pet (sets is_active to false)
func (r *PetRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE pets SET
			is_active = false,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`

	result, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete pet: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("pet not found: %s", id)
	}

	log.Printf("[DB] Deleted pet: %s", id)
	return nil
}

// HardDelete permanently deletes a pet from the database
func (r *PetRepository) HardDelete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM pets WHERE id = $1`

	result, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to hard delete pet: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("pet not found: %s", id)
	}

	log.Printf("[DB] Hard deleted pet: %s", id)
	return nil
}

// GetAll retrieves all active pets (use with caution)
func (r *PetRepository) GetAll(ctx context.Context) ([]*Pet, error) {
	query := `
		SELECT id, user_id, name, stage, hunger, mood, energy, health,
			   complex_genetics, ai_state, day_age, born_at, updated_at, is_active
		FROM pets
		WHERE is_active = true
		ORDER BY born_at DESC
		LIMIT 1000
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all pets: %w", err)
	}
	defer rows.Close()

	var pets []*Pet
	for rows.Next() {
		pet := &Pet{}
		err := rows.Scan(
			&pet.ID,
			&pet.UserID,
			&pet.Name,
			&pet.Stage,
			&pet.Hunger,
			&pet.Mood,
			&pet.Energy,
			&pet.Health,
			&pet.Genetics,
			&pet.AIState,
			&pet.DayAge,
			&pet.BornAt,
			&pet.UpdatedAt,
			&pet.IsActive,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pet: %w", err)
		}
		pets = append(pets, pet)
	}

	return pets, nil
}

// Count returns the number of active pets for a user
func (r *PetRepository) Count(ctx context.Context, userID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM pets WHERE user_id = $1 AND is_active = true`

	var count int
	err := r.pool.QueryRow(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count pets: %w", err)
	}

	return count, nil
}

// Exists checks if a pet exists
func (r *PetRepository) Exists(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM pets WHERE id = $1 AND is_active = true)`

	var exists bool
	err := r.pool.QueryRow(ctx, query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check pet existence: %w", err)
	}

	return exists, nil
}