package tests

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/hagumi/game-loop/db"
	"github.com/hagumi/game-loop/db/migrations"
	"github.com/joho/godotenv"
)

// TestDB holds the test database instance
var TestDB *db.Database

// TestMain sets up the test database before running tests
func TestMain(m *testing.M) {
	// Set up test database
	SetupTestDB()
	
	// Run tests
	code := m.Run()
	
	// Cleanup
	CleanupTestDB()
	
	os.Exit(code)
}

// SetupTestDB initializes the test database
func SetupTestDB() {
	cwd, _ := os.Getwd()
	fmt.Printf(">>> [DEBUG] Current Working Directory: %s\n", cwd)

	// Load .env file if it exists
	envFiles := []string{".env", "../.env", "../../.env", "../../../.env", "../../../../.env"}
	var loadedFile string
	for _, f := range envFiles {
		if err := godotenv.Load(f); err == nil {
			loadedFile = f
			break
		}
	}

	if loadedFile != "" {
		fmt.Printf(">>> [INFO] Loaded environment from: %s\n", loadedFile)
	} else {
		fmt.Println(">>> [WARNING] No .env file loaded, using default values or existing environment")
	}

	// Use test database configuration
	testDBConfig := &db.DBConfig{
		Host:     getEnv("TEST_DB_HOST", "localhost"),
		Port:     getEnv("TEST_DB_PORT", "5432"),
		User:     getEnv("TEST_DB_USER", "postgres"),
		Password: getEnv("TEST_DB_PASSWORD", ""), // Default to empty
		Database: getEnv("TEST_DB_NAME", "hagumi_test"),
		SSLMode:  getEnv("TEST_DB_SSLMODE", "disable"),
		URL:      getEnv("TEST_DB_URL", ""),
	}

	fmt.Printf(">>> [INFO] Using Test Database Host: %s\n", testDBConfig.Host)

	var err error
	TestDB, err = db.NewDatabase(testDBConfig)
	if err != nil {
		fmt.Printf(">>> [ERROR] Database Connection Failed: %v\n", err)
		panic("Failed to connect to test database: " + err.Error())
	}

	// Run test migrations
	migrationRunner := migrations.NewRunner(TestDB.GetPool())
	
	// Try to find migrations directory relative to common test execution points
	migrationDirs := []string{
		"../db/migrations",      // Called from backend/tests/
		"../../db/migrations",   // Called from backend/tests/integration/
		"db/migrations",         // Called from backend/
		"backend/db/migrations", // Called from root
	}

	var loaded bool
	for _, dir := range migrationDirs {
		if _, err := os.Stat(dir); err == nil {
			if err := migrationRunner.LoadMigrations(dir); err == nil {
				loaded = true
				break
			}
		}
	}

	if !loaded {
		panic("Failed to find or load migrations directory in any of the expected locations")
	}

	// Clean up database before running migrations to avoid conflicts
	fmt.Println(">>> [INFO] Cleaning up test database schema...")
	cleanupSQL := `
		DROP TABLE IF EXISTS activity_feed CASCADE;
		DROP TABLE IF EXISTS visits CASCADE;
		DROP TABLE IF EXISTS friends CASCADE;
		DROP TABLE IF EXISTS audit_log CASCADE;
		DROP TABLE IF EXISTS sessions CASCADE;
		DROP TABLE IF EXISTS pets CASCADE;
		DROP TABLE IF EXISTS users CASCADE;
		DROP TABLE IF EXISTS schema_migrations CASCADE;
	`
	if _, err := TestDB.GetPool().Exec(context.Background(), cleanupSQL); err != nil {
		fmt.Printf(">>> [WARNING] Database cleanup failed: %v (This is normal if tables don't exist)\n", err)
	}

	if err := migrationRunner.Up(context.Background()); err != nil {
		panic("Failed to run test migrations: " + err.Error())
	}
}

// CleanupTestDB closes the test database connection
func CleanupTestDB() {
	if TestDB != nil {
		TestDB.Close()
	}
}

// getEnv retrieves environment variable or returns default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// CreateTestContext creates a context with timeout for tests
func CreateTestContext() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 5*time.Second)
}

// AssertEqual checks if two values are equal
func AssertEqual(t *testing.T, expected, actual interface{}, msg string) {
	t.Helper()
	if expected != actual {
		fmt.Printf("[ASSERT_FAILED] %s: expected %v, got %v\n", msg, expected, actual)
		t.Errorf("%s: expected %v, got %v", msg, expected, actual)
	}
}

// AssertNotEqual checks if two values are not equal
func AssertNotEqual(t *testing.T, expected, actual interface{}, msg string) {
	t.Helper()
	if expected == actual {
		fmt.Printf("[ASSERT_FAILED] %s: expected %v to not equal %v\n", msg, expected, actual)
		t.Errorf("%s: expected %v to not equal %v", msg, expected, actual)
	}
}

// AssertNil checks if a value is nil
func AssertNil(t *testing.T, value interface{}, msg string) {
	t.Helper()
	if value != nil {
		fmt.Printf("[ASSERT_FAILED] %s: expected nil, got %v\n", msg, value)
		t.Errorf("%s: expected nil, got %v", msg, value)
	}
}

// AssertNotNil checks if a value is not nil
func AssertNotNil(t *testing.T, value interface{}, msg string) {
	t.Helper()
	if value == nil {
		fmt.Printf("[ASSERT_FAILED] %s: expected non-nil value\n", msg)
		t.Errorf("%s: expected non-nil value", msg)
	}
}

// AssertTrue checks if a condition is true
func AssertTrue(t *testing.T, condition bool, msg string) {
	t.Helper()
	if !condition {
		fmt.Printf("[ASSERT_FAILED] %s: expected true, got false\n", msg)
		t.Errorf("%s: expected true, got false", msg)
	}
}

// AssertFalse checks if a condition is false
func AssertFalse(t *testing.T, condition bool, msg string) {
	t.Helper()
	if condition {
		fmt.Printf("[ASSERT_FAILED] %s: expected false, got true\n", msg)
		t.Errorf("%s: expected false, got true", msg)
	}
}

// CreateTestUser creates a test user in the database
func CreateTestUser(ctx context.Context) (uuid.UUID, error) {
	userID := uuid.New()
	query := `INSERT INTO users (id, email, username, created_at, updated_at) 
	          VALUES ($1, $2, $3, $4, $5)`
	
	_, err := TestDB.GetPool().Exec(ctx, query, 
		userID, 
		"test_"+userID.String()[:8]+"@example.com", 
		"testuser_"+userID.String()[:8], 
		time.Now(), 
		time.Now(),
	)
	if err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}