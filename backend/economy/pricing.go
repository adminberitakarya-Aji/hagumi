package economy

import (
	"context"
	"log"
	"math"
	"sync"
	"time"
)

// PricingItem represents an item subject to dynamic pricing
type PricingItem struct {
	ID           string
	BasePrice    int64
	CurrentPrice int64
	Supply       int64
	Demand       int64
	MinPrice     int64
	MaxPrice     int64
}

// PricingService manages dynamic pricing for the market
// Prices adjust based on supply and demand algorithms.
type PricingService struct {
	items map[string]*PricingItem
	mu    sync.RWMutex
}

func NewPricingService() *PricingService {
	return &PricingService{
		items: make(map[string]*PricingItem),
	}
}

// RegisterItem adds an item to the dynamic pricing system
func (p *PricingService) RegisterItem(id string, basePrice, minPrice, maxPrice int64) {
	p.mu.Lock()
	defer p.mu.Unlock()

	p.items[id] = &PricingItem{
		ID:           id,
		BasePrice:    basePrice,
		CurrentPrice: basePrice,
		Supply:       100, // Initial normalized supply
		Demand:       100, // Initial normalized demand
		MinPrice:     minPrice,
		MaxPrice:     maxPrice,
	}
}

// RecordTransaction updates supply/demand based on a sale
func (p *PricingService) RecordTransaction(ctx context.Context, itemID string, quantity int64, isBuy bool) {
	p.mu.Lock()
	defer p.mu.Unlock()

	item, exists := p.items[itemID]
	if !exists {
		return
	}

	// Simple market maker algorithm
	if isBuy {
		item.Demand += quantity
		item.Supply = int64(math.Max(float64(item.Supply-quantity), 10))
	} else {
		// Someone is selling to the system
		item.Supply += quantity
		item.Demand = int64(math.Max(float64(item.Demand-quantity), 10))
	}
}

// RecalculatePrices runs periodically to adjust prices based on accumulated supply and demand
func (p *PricingService) RecalculatePrices() {
	p.mu.Lock()
	defer p.mu.Unlock()

	log.Println("[Economy] Recalculating dynamic prices...")

	for _, item := range p.items {
		// Calculate Demand to Supply ratio
		ratio := float64(item.Demand) / float64(item.Supply)
		
		// Adjust price based on ratio. 
		// If demand > supply (ratio > 1), price goes up.
		// If supply > demand (ratio < 1), price goes down.
		
		// Use a dampening factor to prevent wild swings (e.g., 0.1 max change per tick)
		dampening := 0.05
		adjustment := (ratio - 1.0) * dampening
		
		// Cap adjustment
		if adjustment > 0.1 {
			adjustment = 0.1
		} else if adjustment < -0.1 {
			adjustment = -0.1
		}

		newPrice := float64(item.CurrentPrice) * (1.0 + adjustment)
		
		// Clamp to min/max
		item.CurrentPrice = int64(math.Min(math.Max(newPrice, float64(item.MinPrice)), float64(item.MaxPrice)))
		
		// Slowly normalize supply and demand back to equilibrium (100) to forget very old history
		item.Supply = int64(float64(item.Supply)*0.95 + 100*0.05)
		item.Demand = int64(float64(item.Demand)*0.95 + 100*0.05)
		
		log.Printf("[Economy] Item %s new price: %d (Ratio: %.2f)", item.ID, item.CurrentPrice, ratio)
	}
}

// StartPricingEngine starts the background loop for dynamic pricing
func (p *PricingService) StartPricingEngine(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Hour) // Adjust prices every hour
	
	// Register some default items
	p.RegisterItem("basic_food", 10, 5, 30)
	p.RegisterItem("medicine", 50, 20, 150)
	p.RegisterItem("rare_seed", 500, 100, 2000)

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				p.RecalculatePrices()
			}
		}
	}()
}
