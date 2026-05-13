package tests

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/hagumi/game-loop/db"
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
	// Use test database configuration
	testDBConfig := &db.DBConfig{
		Host:     getEnv("TEST_DB_HOST", "localhost"),
		Port:     getEnv("TEST_DB_PORT", "5432"),
		User:     getEnv("TEST_DB_USER", "postgres"),
		Password: getEnv("TEST_DB_PASSWORD", ""),
		Database: getEnv("TEST_DB_NAME", "hagumi_test"),
		SSLMode:  getEnv("TEST_DB_SSLMODE", "disable"),
	}

	var err error
	TestDB, err = db.NewDatabase(testDBConfig)
	if err != nil {
		panic("Failed to connect to test database: " + err.Error())
	}

	// Run test migrations
	// Note: In production, you'd have separate test migrations
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
		t.Errorf("%s: expected %v, got %v", msg, expected, actual)
	}
}

// AssertNotEqual checks if two values are not equal
func AssertNotEqual(t *testing.T, expected, actual interface{}, msg string) {
	t.Helper()
	if expected == actual {
		t.Errorf("%s: expected %v to not equal %v", msg, expected, actual)
	}
}

// AssertNil checks if a value is nil
func AssertNil(t *testing.T, value interface{}, msg string) {
	t.Helper()
	if value != nil {
		t.Errorf("%s: expected nil, got %v", msg, value)
	}
}

// AssertNotNil checks if a value is not nil
func AssertNotNil(t *testing.T, value interface{}, msg string) {
	t.Helper()
	if value == nil {
		t.Errorf("%s: expected non-nil value", msg)
	}
}

// AssertTrue checks if a condition is true
func AssertTrue(t *testing.T, condition bool, msg string) {
	t.Helper()
	if !condition {
		t.Errorf("%s: expected true, got false", msg)
	}
}

// AssertFalse checks if a condition is false
func AssertFalse(t *testing.T, condition bool, msg string) {
	t.Helper()
	if condition {
		t.Errorf("%s: expected false, got true", msg)
	}
}