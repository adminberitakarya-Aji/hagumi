package events

import (
	"time"
)

// EventType represents the category of the seasonal event
type EventType string

const (
	EventSeasonal EventType = "seasonal"
	EventHoliday  EventType = "holiday"
	EventFlash    EventType = "flash"
)

// SeasonalEvent defines the structure of a limited-time game event
type SeasonalEvent struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Type        EventType `json:"type"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	IsActive    bool      `json:"is_active"`
}

// EventManager handles the scheduling and logic of seasonal events
type EventManager struct {
	ActiveEvents []SeasonalEvent
}

func NewEventManager() *EventManager {
	return &EventManager{
		ActiveEvents: make([]SeasonalEvent, 0),
	}
}

// CheckActiveEvents updates the status of events based on the current time
func (m *EventManager) CheckActiveEvents() {
	now := time.Now()
	for i := range m.ActiveEvents {
		event := &m.ActiveEvents[i]
		if now.After(event.StartDate) && now.Before(event.EndDate) {
			event.IsActive = true
		} else {
			event.IsActive = false
		}
	}
}

// AddEvent adds a new seasonal event to the system
func (m *EventManager) AddEvent(event SeasonalEvent) {
	m.ActiveEvents = append(m.ActiveEvents, event)
	m.CheckActiveEvents()
}

// GetRewardMultiplier returns bonus multipliers during active events
func (m *EventManager) GetRewardMultiplier() float64 {
	multiplier := 1.0
	for _, event := range m.ActiveEvents {
		if event.IsActive {
			multiplier += 0.5 // 50% bonus during events
		}
	}
	return multiplier
}
