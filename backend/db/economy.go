package db

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)

// EconomyRepository handles database operations for the economy system
type EconomyRepository struct {
	pool *pgxpool.Pool
}

// NewEconomyRepository creates a new economy repository
func NewEconomyRepository(pool *pgxpool.Pool) *EconomyRepository {
	return &EconomyRepository{pool: pool}
}

// GetTotalCoinsInCirculation returns the sum of all player coins
func (r *EconomyRepository) GetTotalCoinsInCirculation(ctx context.Context) (int64, error) {
	var total int64
	err := r.pool.QueryRow(ctx, "SELECT COALESCE(SUM(coins), 0) FROM players").Scan(&total)
	return total, err
}

// GetDailyGeneratedCoins returns the total coins generated in the last 24 hours
func (r *EconomyRepository) GetDailyGeneratedCoins(ctx context.Context) (int64, error) {
	// Placeholder for actual transaction tracking
	return 0, nil
}

// GetDailySpentCoins returns the total coins spent in the last 24 hours
func (r *EconomyRepository) GetDailySpentCoins(ctx context.Context) (int64, error) {
	// Placeholder for actual transaction tracking
	return 0, nil
}
