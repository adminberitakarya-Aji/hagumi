package migrations

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Migration represents a database migration
type Migration struct {
	Version     string
	Description string
	UpSQL       string
	DownSQL     string
}

// Runner handles database migrations
type Runner struct {
	pool       *pgxpool.Pool
	migrations []Migration
}

// NewRunner creates a new migration runner
func NewRunner(pool *pgxpool.Pool) *Runner {
	return &Runner{
		pool: pool,
	}
}

// LoadMigrations loads migration files from a directory
func (r *Runner) LoadMigrations(dir string) error {
	files, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	for _, file := range files {
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".sql") {
			continue
		}

		path := filepath.Join(dir, file.Name())
		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", file.Name(), err)
		}

		// Parse version and description from filename
		// Format: 001_description.sql
		parts := strings.Split(file.Name(), "_")
		if len(parts) < 2 {
			log.Printf("[Migrations] Skipping invalid migration file: %s", file.Name())
			continue
		}

		version := parts[0]
		description := strings.TrimSuffix(strings.Join(parts[1:], "_"), ".sql")

		migration := Migration{
			Version:     version,
			Description: description,
			UpSQL:       string(content),
		}

		r.migrations = append(r.migrations, migration)
		log.Printf("[Migrations] Loaded migration: %s - %s", version, description)
	}

	// Sort migrations by version
	sort.Slice(r.migrations, func(i, j int) bool {
		return r.migrations[i].Version < r.migrations[j].Version
	})

	return nil
}

// Up runs all pending migrations
func (r *Runner) Up(ctx context.Context) error {
	// Create migrations table if it doesn't exist
	if err := r.createMigrationsTable(ctx); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Get applied migrations
	applied, err := r.getAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Run pending migrations
	for _, migration := range r.migrations {
		if _, exists := applied[migration.Version]; exists {
			log.Printf("[Migrations] Skipping already applied migration: %s", migration.Version)
			continue
		}

		log.Printf("[Migrations] Applying migration: %s - %s", migration.Version, migration.Description)

		// Start transaction
		tx, err := r.pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("failed to begin transaction: %w", err)
		}

		// Execute migration
		if _, err := tx.Exec(ctx, migration.UpSQL); err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("failed to apply migration %s: %w", migration.Version, err)
		}

		// Record migration
		if _, err := tx.Exec(ctx, 
			"INSERT INTO schema_migrations (version, description, applied_at) VALUES ($1, $2, $3)",
			migration.Version, migration.Description, time.Now()); err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("failed to record migration %s: %w", migration.Version, err)
		}

		// Commit transaction
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("failed to commit migration %s: %w", migration.Version, err)
		}

		log.Printf("[Migrations] Successfully applied migration: %s", migration.Version)
	}

	log.Printf("[Migrations] All migrations applied successfully")
	return nil
}

// Down rolls back the last migration
func (r *Runner) Down(ctx context.Context) error {
	// Get the last applied migration
	var version, description string
	err := r.pool.QueryRow(ctx, 
		"SELECT version, description FROM schema_migrations ORDER BY applied_at DESC LIMIT 1").
		Scan(&version, &description)
	if err != nil {
		if err == pgx.ErrNoRows {
			log.Println("[Migrations] No migrations to rollback")
			return nil
		}
		return fmt.Errorf("failed to get last migration: %w", err)
	}

	log.Printf("[Migrations] Rolling back migration: %s - %s", version, description)

	// Start transaction
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Find the migration
	var migration *Migration
	for _, m := range r.migrations {
		if m.Version == version {
			migration = &m
			break
		}
	}

	if migration == nil {
		tx.Rollback(ctx)
		return fmt.Errorf("migration %s not found", version)
	}

	// Execute rollback (if down SQL is provided)
	if migration.DownSQL != "" {
		if _, err := tx.Exec(ctx, migration.DownSQL); err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("failed to rollback migration %s: %w", version, err)
		}
	}

	// Remove migration record
	if _, err := tx.Exec(ctx, "DELETE FROM schema_migrations WHERE version = $1", version); err != nil {
		tx.Rollback(ctx)
		return fmt.Errorf("failed to remove migration record %s: %w", version, err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit rollback %s: %w", version, err)
	}

	log.Printf("[Migrations] Successfully rolled back migration: %s", version)
	return nil
}

// Status shows the status of migrations
func (r *Runner) Status(ctx context.Context) error {
	applied, err := r.getAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	log.Println("[Migrations] Migration Status:")
	log.Println("================================")
	
	for _, migration := range r.migrations {
		status := "PENDING"
		if _, exists := applied[migration.Version]; exists {
			status = "APPLIED"
		}
		log.Printf("  %s - %s: %s", migration.Version, migration.Description, status)
	}

	return nil
}

// createMigrationsTable creates the schema_migrations table
func (r *Runner) createMigrationsTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			id SERIAL PRIMARY KEY,
			version VARCHAR(20) UNIQUE NOT NULL,
			description TEXT NOT NULL,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`

	_, err := r.pool.Exec(ctx, query)
	return err
}

// getAppliedMigrations returns a map of applied migrations
func (r *Runner) getAppliedMigrations(ctx context.Context) (map[string]bool, error) {
	query := "SELECT version FROM schema_migrations ORDER BY applied_at ASC"

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}

	return applied, nil
}