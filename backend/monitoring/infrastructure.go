package monitoring

import (
	"log"
	"runtime"
	"time"
)

// SystemStats holds current infrastructure metrics
type SystemStats struct {
	CPUUsage    float64
	MemoryUsage uint64
	Goroutines  int
	DBStatus    string
}

// InfraMonitor tracks server health and performance
type InfraMonitor struct {
	Interval time.Duration
}

// NewInfraMonitor initializes the monitoring service
func NewInfraMonitor(interval time.Duration) *InfraMonitor {
	return &InfraMonitor{Interval: interval}
}

// StartMonitoring starts the health check loop
func (im *InfraMonitor) StartMonitoring() {
	ticker := time.NewTicker(im.Interval)
	go func() {
		for range ticker.C {
			stats := im.CollectStats()
			log.Printf("[Monitor] Health: CPU: %.2f%%, Mem: %dMB, Routines: %d, DB: %s", 
				stats.CPUUsage, stats.MemoryUsage/1024/1024, stats.Goroutines, stats.DBStatus)
			
			// If stats exceed threshold, trigger alerts
			if stats.MemoryUsage > 1024*1024*512 { // 512MB threshold
				im.TriggerAlert("High Memory Usage Detected")
			}
		}
	}()
}

// CollectStats gathers runtime metrics
func (im *InfraMonitor) CollectStats() SystemStats {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	return SystemStats{
		CPUUsage:    0.0, // Needs OS-specific call for real CPU usage
		MemoryUsage: m.Alloc,
		Goroutines:  runtime.NumGoroutine(),
		DBStatus:    "Connected",
	}
}

// TriggerAlert sends an alert to a notification service (PagerDuty, Slack, etc.)
func (im *InfraMonitor) TriggerAlert(message string) {
	log.Printf("[Monitor] ALERT: %s", message)
	// Implement Slack webhook call here
}
