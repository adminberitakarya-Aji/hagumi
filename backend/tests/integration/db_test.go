package integration

import (
	"context"
	"testing"
	"time"

	"hagumi/game-loop/db"
	"hagumi/game-loop/tests"
)

// TestDB_Connection tests database connection
func TestDB_Connection(t *testing.T) {
	ctx, cancel := tests.CreateTestContext()
	defer cancel()

	err := tests.TestDB.Ping(ctx)
	tests.AssertNil(t, err, "Database ping should succeed")
}

// TestDB_HealthCheck tests database health check
func TestDB_HealthCheck(t *testing.T) {
	ctx, cancel := tests.CreateTestContext()
	defer cancel()

	err := tests.TestDB.HealthCheck(ctx)
	tests.AssertNil(t, err, "Health check should succeed")
}

// TestDB_ConnectionPool tests connection pool
func TestDB_ConnectionPool(t *testing.T) {
	pool := tests.TestDB.GetPool()
	tests.AssertNotNil(t, pool, "Connection pool should not be nil")

	stats := tests.TestDB.GetStats()
	tests.AssertNotNil(t, stats, "Pool stats should not be nil")
}

// TestDB_PetCRUD tests pet CRUD operations
func TestDB_PetCRUD(t *testing.T) {
	ctx, cancel := tests.CreateTestContext()
	defer cancel()

	pool := tests.TestDB.GetPool()
	petRepo := db.NewPetRepository(pool)

	// Test Create
	petID := "test-pet-123"
	userID := "test-user-456"
	
	pet := &db.Pet{
		ID:     petID,
		UserID: userID,
		Name:   "Test Pet",
		Stage:  "alive",
		Stats: db.PetStats{
			Hunger: 80,
			Mood:   75,
			Energy: 90,
			Health: 100,
		},
		Genetics: db.PetGenetics{
			BaseHungerRate: 1.0,
			BaseMoodRate:   1.0,
			BaseEnergyRate: 1.0,
			GrowthSpeed:    1.0,
			Personality:    "playful",
		},
		DayAge:    1,
		BornAt:    time.Now(),
		UpdatedAt: time.Now(),
	}

	err := petRepo.Create(ctx, pet)
	tests.AssertNil(t, err, "Pet creation should succeed")

	// Test Read
	retrievedPet, err := petRepo.GetByID(ctx, petID)
	tests.AssertNil(t, err, "Pet retrieval should succeed")
	tests.AssertNotNil(t, retrievedPet, "Retrieved pet should not be nil")
	tests.AssertEqual(t, pet.Name, retrievedPet.Name, "Pet name should match")

	// Test Update
	pet.Stats.Hunger = 90
	err = petRepo.Update(ctx, pet)
	tests.AssertNil(t, err, "Pet update should succeed")

	// Test Delete
	err = petRepo.Delete(ctx, petID)
	tests.AssertNil(t, err, "Pet deletion should succeed")

	// Verify deletion
	_, err = petRepo.GetByID(ctx, petID)
	tests.AssertNotNil(t, err, "Retrieval after deletion should fail")
}

// TestDB_Transaction tests transaction handling
func TestDB_Transaction(t *testing.T) {
	ctx, cancel := tests.CreateTestContext()
	defer cancel()

	pool := tests.TestDB.GetPool()
	petRepo := db.NewPetRepository(pool)

	// Begin transaction
	tx, err := pool.Begin(ctx)
	tests.AssertNil(t, err, "Transaction begin should succeed")
	defer tx.Rollback(ctx)

	// Create pet in transaction
	petID := "test-pet-tx-123"
	pet := &db.Pet{
		ID:     petID,
		UserID: "test-user-tx-456",
		Name:   "Transaction Pet",
		Stage:  "alive",
		Stats: db.PetStats{
			Hunger: 50,
			Mood:   50,
			Energy: 50,
			Health: 50,
		},
		Genetics: db.PetGenetics{
			BaseHungerRate: 1.0,
			BaseMoodRate:   1.0,
			BaseEnergyRate: 1.0,
			GrowthSpeed:    1.0,
			Personality:    "playful",
		},
		DayAge:    0,
		BornAt:    time.Now(),
		UpdatedAt: time.Now(),
	}

	err = petRepo.Create(ctx, pet)
	tests.AssertNil(t, err, "Pet creation in transaction should succeed")

	// Rollback transaction
	err = tx.Rollback(ctx)
	tests.AssertNil(t, err, "Transaction rollback should succeed")

	// Verify pet was not committed
	_, err = petRepo.GetByID(ctx, petID)
	tests.AssertNotNil(t, err, "Pet should not exist after rollback")
}

// TestDB_ConcurrentAccess tests concurrent database access
func TestDB_ConcurrentAccess(t *testing.T) {
	ctx, cancel := tests.CreateTestContext()
	defer cancel()

	pool := tests.TestDB.GetPool()
	petRepo := db.NewPetRepository(pool)

	// Create multiple pets concurrently
	numPets := 10
	done := make(chan bool, numPets)

	for i := 0; i < numPets; i++ {
		go func(index int) {
			petID := "test-pet-concurrent-" + string(rune(index))
			pet := &db.Pet{
				ID:     petID,
				UserID: "test-user-concurrent",
				Name:   "Concurrent Pet",
				Stage:  "alive",
				Stats: db.PetStats{
					Hunger: 50,
					Mood:   50,
					Energy: 50,
					Health: 50,
				},
				Genetics: db.PetGenetics{
					BaseHungerRate: 1.0,
					BaseMoodRate:   1.0,
					BaseEnergyRate: 1.0,
					GrowthSpeed:    1.0,
					Personality:    "playful",
				},
				DayAge:    0,
				BornAt:    time.Now(),
				UpdatedAt: time.Now(),
			}

			err := petRepo.Create(ctx, pet)
			tests.AssertNil(t, err, "Concurrent pet creation should succeed")
			done <- true
		}(i)
	}

	// Wait for all operations to complete
	for i := 0; i < numPets; i++ {
		<-done
	}
}

// TestDB_DataConsistency tests data consistency
func TestDB_DataConsistency(t *testing.T) {
	ctx, cancel := tests.CreateTestContext()
	defer cancel()

	pool := tests.TestDB.GetPool()
	petRepo := db.NewPetRepository(pool)

	// Create pet
	petID := "test-pet-consistency-123"
	pet := &db.Pet{
		ID:     petID,
		UserID: "test-user-consistency",
		Name:   "Consistency Pet",
		Stage:  "alive",
		Stats: db.PetStats{
			Hunger: 75,
			Mood:   80,
			Energy: 85,
			Health: 90,
		},
		Genetics: db.PetGenetics{
			BaseHungerRate: 1.0,
			BaseMoodRate:   1.0,
			BaseEnergyRate: 1.0,
			GrowthSpeed:    1.0,
			Personality:    "playful",
		},
		DayAge:    5,
		BornAt:    time.Now(),
		UpdatedAt: time.Now(),
	}

	err := petRepo.Create(ctx, pet)
	tests.AssertNil(t, err, "Pet creation should succeed")

	// Retrieve and verify
	retrievedPet, err := petRepo.GetByID(ctx, petID)
	tests.AssertNil(t, err, "Pet retrieval should succeed")

	tests.AssertEqual(t, pet.Stats.Hunger, retrievedPet.Stats.Hunger, "Hunger should match")
	tests.AssertEqual(t, pet.Stats.Mood, retrievedPet.Stats.Mood, "Mood should match")
	tests.AssertEqual(t, pet.Stats.Energy, retrievedPet.Stats.Energy, "Energy should match")
	tests.AssertEqual(t, pet.Stats.Health, retrievedPet.Stats.Health, "Health should match")
	tests.AssertEqual(t, pet.DayAge, retrievedPet.DayAge, "Day age should match")

	// Cleanup
	err = petRepo.Delete(ctx, petID)
	tests.AssertNil(t, err, "Pet deletion should succeed")
}