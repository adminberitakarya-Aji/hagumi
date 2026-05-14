package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DBTX is an interface that matches both *pgxpool.Pool and pgx.Tx
type DBTX interface {
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
}

// DBConfig holds database configuration
type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	SSLMode  string
	URL      string // Optional: Full connection URL
}

// DefaultDBConfig returns default database configuration
func DefaultDBConfig() *DBConfig {
	return &DBConfig{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", ""),
		Database: getEnv("DB_NAME", "hagumi"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}
}

// Database holds the database connection pool
type Database struct {
	pool *pgxpool.Pool
}

// NewDatabase creates a new database connection pool
func NewDatabase(config *DBConfig) (*Database, error) {
	connString := config.URL
	if connString == "" {
		connString = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			config.Host,
			config.Port,
			config.User,
			config.Password,
			config.Database,
			config.SSLMode,
		)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Printf("[DB] Connected to database: %s@%s:%s/%s", 
		config.User, config.Host, config.Port, config.Database)

	return &Database{pool: pool}, nil
}

// GetPool returns the connection pool
func (db *Database) GetPool() *pgxpool.Pool {
	return db.pool
}

// Close closes the database connection pool
func (db *Database) Close() error {
	if db.pool != nil {
		db.pool.Close()
		log.Println("[DB] Database connection closed")
	}
	return nil
}

// Ping checks if the database is reachable
func (db *Database) Ping(ctx context.Context) error {
	return db.pool.Ping(ctx)
}

// GetStats returns connection pool statistics
func (db *Database) GetStats() *pgxpool.Stat {
	return db.pool.Stat()
}

// HealthCheck performs a health check on the database
func (db *Database) HealthCheck(ctx context.Context) error {
	if db.pool == nil {
		return fmt.Errorf("database connection pool is nil")
	}

	// Simple query to test connection
	var result int
	err := db.pool.QueryRow(ctx, "SELECT 1").Scan(&result)
	if err != nil {
		return fmt.Errorf("database health check failed: %w", err)
	}

	return nil
}

// getEnv retrieves environment variable or returns default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}