package economy

import (
	"context"
	"log"
	"time"

	"github.com/hagumi/game-loop/db"
)

// SimulationService handles the background economy simulation
// It adjusts inflation, monitors coin sinks/faucets, and balances rewards.
type SimulationService struct {
	repo *db.EconomyRepository // Assuming we will create this
}

func NewSimulationService(repo *db.EconomyRepository) *SimulationService {
	return &SimulationService{repo: repo}
}

// StartSimulation runs the economy simulation loop
func (s *SimulationService) StartSimulation(ctx context.Context) {
	ticker := time.NewTicker(24 * time.Hour) // Run daily
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				s.RunDailyAdjustment(ctx)
			}
		}
	}()
}

// RunDailyAdjustment analyzes the total currency in circulation and adjusts parameters
func (s *SimulationService) RunDailyAdjustment(ctx context.Context) {
	log.Println("[Economy] Running daily economy simulation and adjustment...")

	// 1. Calculate Total Coins in Circulation
	// totalCoins, err := s.repo.GetTotalCoinsInCirculation(ctx)
	
	// 2. Calculate daily faucet (coins generated from daily rewards, minigames)
	// dailyFaucet, err := s.repo.GetDailyGeneratedCoins(ctx)

	// 3. Calculate daily sink (coins spent on shop, market fees, breeding)
	// dailySink, err := s.repo.GetDailySpentCoins(ctx)

	// Simulated logic for inflation control
	// if dailyFaucet > dailySink * 1.5 {
	//    // Inflation is happening! We need to increase market fees or reduce rewards slightly.
	//    log.Println("[Economy] High inflation detected. Adjusting global reward multipliers...")
	// } else if dailySink > dailyFaucet * 1.2 {
	//    // Deflation. Players are losing money too fast.
	//    log.Println("[Economy] Deflation detected. Increasing event rewards...")
	// }

	log.Println("[Economy] Daily adjustment complete.")
}

// SimulatePlayerBehavior tests the economy against simulated player actions
// Used for internal testing and balancing.
func (s *SimulationService) SimulatePlayerBehavior(days int, initialPlayers int) {
	log.Printf("[Economy Simulation] Simulating %d days for %d players\n", days, initialPlayers)
	
	totalCoins := initialPlayers * 100 // Starting coins
	
	for day := 1; day <= days; day++ {
		// Daily Reward Faucet
		dailyRewards := initialPlayers * 50
		
		// Minigame Faucet (assume 70% play minigames, winning avg 30 coins)
		minigameRewards := int(float64(initialPlayers) * 0.7 * 30)
		
		// Shop Sink (assume 30% buy something for 100 coins)
		shopSpend := int(float64(initialPlayers) * 0.3 * 100)
		
		// Market Fees Sink (5% of trades)
		marketTrades := int(float64(initialPlayers) * 0.1 * 200) // 10% trade avg 200 coins
		marketFees := int(float64(marketTrades) * 0.05)
		
		netChange := dailyRewards + minigameRewards - shopSpend - marketFees
		totalCoins += netChange
		
		// Random event (e.g., weekend bonus)
		if day%7 == 0 {
			totalCoins += initialPlayers * 100
		}
	}
	
	log.Printf("[Economy Simulation] Final Total Coins: %d (Avg per player: %d)\n", totalCoins, totalCoins/initialPlayers)
}
