package integration

import (
	"fmt"
	"os"
	"testing"

	"github.com/hagumi/game-loop/tests"
)

func TestMain(m *testing.M) {
	fmt.Println(">>> Starting Integration Test Suite")
	
	// Set up test environment for integration tests
	tests.SetupTestDB()
	
	// Run tests
	code := m.Run()
	
	if code != 0 {
		fmt.Printf("\n>>> [FAILURE] Test suite exited with non-zero code: %d\n", code)
	} else {
		fmt.Println("\n>>> [SUCCESS] All tests passed!")
	}
	
	// Cleanup
	tests.CleanupTestDB()
	
	os.Exit(code)
}
