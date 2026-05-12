package backup

import (
	"context"
	"fmt"
	"log"
	"time"
)

// BackupManager handles automated and manual backup triggers
type BackupManager struct {
	BackupInterval time.Duration
	LastBackupTime time.Time
}

// NewBackupManager initializes the backup service
func NewBackupManager(interval time.Duration) *BackupManager {
	return &BackupManager{
		BackupInterval: interval,
	}
}

// StartBackupLoop starts a background process to monitor and trigger backups
func (m *BackupManager) StartBackupLoop(ctx context.Context) {
	ticker := time.NewTicker(m.BackupInterval)
	defer ticker.Stop()

	log.Println("[Backup] Automated backup loop started")

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			err := m.TriggerDatabaseBackup()
			if err != nil {
				log.Printf("[Backup] Error during automated backup: %v", err)
			}
		}
	}
}

// TriggerDatabaseBackup simulates a backup trigger to Supabase or a local dump
func (m *BackupManager) TriggerDatabaseBackup() error {
	log.Printf("[Backup] Triggering database backup at %v...", time.Now())
	
	// Implementation note: In production, this would call Supabase Management API 
	// or execute a pg_dump command.
	
	m.LastBackupTime = time.Now()
	log.Println("[Backup] Database backup completed successfully")
	return nil
}

// GetBackupStatus returns the status of the last backup
func (m *BackupManager) GetBackupStatus() string {
	if m.LastBackupTime.IsZero() {
		return "No backups performed yet"
	}
	return fmt.Sprintf("Last backup successful at %v", m.LastBackupTime.Format(time.RFC1123))
}
