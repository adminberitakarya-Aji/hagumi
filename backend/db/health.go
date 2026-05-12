package db

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// HealthStatus represents the health status of the database
type HealthStatus struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Database struct {
		Connected bool   `json:"connected"`
		Latency   string `json:"latency"`
		PoolStats struct {
			MaxConns        int32 `json:"max_conns"`
			CurrentConns    int32 `json:"current_conns"`
			IdleConns       int32 `json:"idle_conns"`
			EmptyAcquireCount int64 `json:"empty_acquire_count"`
		} `json:"pool_stats"`
	} `json:"database"`
}

// HealthCheckHandler returns an HTTP handler for health checks
func (db *Database) HealthCheckHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		status := HealthStatus{
			Status:    "ok",
			Timestamp: time.Now(),
		}

		// Check database connection
		start := time.Now()
		err := db.HealthCheck(ctx)
		latency := time.Since(start)

		if err != nil {
			status.Status = "error"
			status.Database.Connected = false
			status.Database.Latency = latency.String()
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(status)
			return
		}

		status.Database.Connected = true
		status.Database.Latency = latency.String()

		// Get pool statistics
		stats := db.GetStats()
		status.Database.PoolStats.MaxConns = stats.MaxConns()
		status.Database.PoolStats.CurrentConns = stats.TotalConns()
		status.Database.PoolStats.IdleConns = stats.IdleConns()
		status.Database.PoolStats.EmptyAcquireCount = stats.EmptyAcquireCount()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(status)
	}
}

// ReadinessCheck checks if the database is ready to accept connections
func (db *Database) ReadinessCheck(ctx context.Context) error {
	if db.pool == nil {
		return ErrDatabaseNotInitialized
	}

	// Ping the database
	if err := db.Ping(ctx); err != nil {
		return err
	}

	return nil
}

// LivenessCheck checks if the database is alive
func (db *Database) LivenessCheck(ctx context.Context) error {
	if db.pool == nil {
		return ErrDatabaseNotInitialized
	}

	// Simple query to verify database is responding
	var result int
	err := db.pool.QueryRow(ctx, "SELECT 1").Scan(&result)
	if err != nil {
		return err
	}

	return nil
}

// Database errors
var (
	ErrDatabaseNotInitialized = &DBError{
		Code:    "DB_NOT_INITIALIZED",
		Message: "Database connection pool is not initialized",
	}
	ErrConnectionFailed = &DBError{
		Code:    "CONNECTION_FAILED",
		Message: "Failed to connect to database",
	}
	ErrQueryFailed = &DBError{
		Code:    "QUERY_FAILED",
		Message: "Database query failed",
	}
)

// DBError represents a database error
type DBError struct {
	Code    string
	Message string
	Err     error
}

func (e *DBError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *DBError) Unwrap() error {
	return e.Err
}