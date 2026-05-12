package events

import (
	"testing"
	"time"
)

func TestEventManager_CheckActiveEvents(t *testing.T) {
	m := NewEventManager()
	
	now := time.Now()
	
	// Past event
	m.AddEvent(SeasonalEvent{
		ID: "past",
		StartDate: now.Add(-48 * time.Hour),
		EndDate: now.Add(-24 * time.Hour),
	})
	
	// Future event
	m.AddEvent(SeasonalEvent{
		ID: "future",
		StartDate: now.Add(24 * time.Hour),
		EndDate: now.Add(48 * time.Hour),
	})
	
	// Active event
	m.AddEvent(SeasonalEvent{
		ID: "active",
		StartDate: now.Add(-12 * time.Hour),
		EndDate: now.Add(12 * time.Hour),
	})
	
	m.CheckActiveEvents()
	
	for _, event := range m.ActiveEvents {
		if event.ID == "active" && !event.IsActive {
			t.Errorf("Event 'active' should be active")
		}
		if (event.ID == "past" || event.ID == "future") && event.IsActive {
			t.Errorf("Event '%s' should not be active", event.ID)
		}
	}
}

func TestEventManager_GetRewardMultiplier(t *testing.T) {
	m := NewEventManager()
	now := time.Now()
	
	// Initially 1.0
	if m.GetRewardMultiplier() != 1.0 {
		t.Errorf("Default multiplier should be 1.0, got %f", m.GetRewardMultiplier())
	}
	
	// Add active event
	m.AddEvent(SeasonalEvent{
		ID: "bonus",
		StartDate: now.Add(-1 * time.Hour),
		EndDate: now.Add(1 * time.Hour),
	})
	
	if m.GetRewardMultiplier() <= 1.0 {
		t.Errorf("Multiplier should increase during active event, got %f", m.GetRewardMultiplier())
	}
}
