package integration

import (
	"os"
	"testing"

	"github.com/hagumi/game-loop/tests"
)

func TestMain(m *testing.M) {
	// Set up test environment for integration tests
	tests.SetupTestDB()
	
	// Run tests
	code := m.Run()
	
	// Cleanup
	tests.CleanupTestDB()
	
	os.Exit(code)
}
