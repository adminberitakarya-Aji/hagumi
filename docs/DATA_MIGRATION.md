# Data Migration Guide

## Overview
This document provides comprehensive guidance for data migration in HAGUMI-APP, including procedures, best practices, and troubleshooting.

## Table of Contents
1. [Migration Strategy](#migration-strategy)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Procedures](#migration-procedures)
4. [Rollback Procedures](#rollback-procedures)
5. [Data Validation](#data-validation)
6. [Troubleshooting](#troubleshooting)

---

## Migration Strategy

### Migration Approach
HAGUMI-APP uses a **versioned migration system** with the following characteristics:

- **Incremental**: Each migration is a single, atomic change
- **Reversible**: All migrations can be rolled back
- **Versioned**: Migrations are numbered sequentially (001, 002, etc.)
- **Tracked**: Applied migrations are recorded in `schema_migrations` table

### Migration Types

#### Schema Migrations
- Create/modify tables
- Add/remove columns
- Create/drop indexes
- Create/drop constraints

#### Data Migrations
- Transform existing data
- Populate new tables
- Update data formats
- Migrate from legacy systems

---

## Pre-Migration Checklist

### Environment Preparation
- [ ] Backup current database
- [ ] Review migration scripts
- [ ] Test migrations in staging environment
- [ ] Schedule maintenance window
- [ ] Notify stakeholders

### Database Preparation
- [ ] Verify database connectivity
- [ ] Check available disk space
- [ ] Verify user permissions
- [ ] Check for active connections
- [ ] Review current schema

### Code Preparation
- [ ] Update application code for new schema
- [ ] Update API endpoints if needed
- [ ] Update data models
- [ ] Test with new schema locally
- [ ] Prepare rollback plan

---

## Migration Procedures

### Running Migrations

#### Using Go Migration Runner

```go
package main

import (
    "context"
    "log"
    
    "hagumi/game-loop/db"
    "hagumi/game-loop/db/migrations"
)

func main() {
    // Initialize database
    dbConfig := db.DefaultDBConfig()
    database, err := db.NewDatabase(dbConfig)
    if err != nil {
        log.Fatalf("Failed to initialize database: %v", err)
    }
    defer database.Close()
    
    // Create migration runner
    runner := migrations.NewRunner(database.GetPool())
    
    // Load migrations from directory
    if err := runner.LoadMigrations("backend/db/migrations"); err != nil {
        log.Fatalf("Failed to load migrations: %v", err)
    }
    
    // Run pending migrations
    if err := runner.Up(context.Background()); err != nil {
        log.Fatalf("Failed to run migrations: %v", err)
    }
    
    log.Println("Migrations completed successfully")
}
```

#### Using Command Line

```bash
# Run all pending migrations
go run backend/cmd/migrate.go up

# Rollback last migration
go run backend/cmd/migrate.go down

# Show migration status
go run backend/cmd/migrate.go status
```

### Migration Workflow

1. **Preparation**
   ```bash
   # Create backup
   pg_dump -U postgres hagumi > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Testing**
   ```bash
   # Test in staging first
   export DB_HOST=staging-db.example.com
   go run backend/cmd/migrate.go up
   ```

3. **Production Migration**
   ```bash
   # Run in production
   export DB_HOST=prod-db.example.com
   go run backend/cmd/migrate.go up
   ```

4. **Verification**
   ```bash
   # Check migration status
   go run backend/cmd/migrate.go status
   
   # Verify data integrity
   go run backend/cmd/verify.go
   ```

---

## Rollback Procedures

### Automatic Rollback

If a migration fails, it will automatically rollback:

```go
// Migration with transaction
tx, err := pool.Begin(ctx)
if err != nil {
    return err
}

defer func() {
    if err != nil {
        tx.Rollback(ctx)
    }
}()

// Execute migration
if _, err := tx.Exec(ctx, migration.UpSQL); err != nil {
    return err
}

// Commit
if err := tx.Commit(ctx); err != nil {
    return err
}
```

### Manual Rollback

#### Rollback Last Migration
```bash
go run backend/cmd/migrate.go down
```

#### Rollback to Specific Version
```bash
# Rollback multiple migrations
go run backend/cmd/migrate.go down --version=003
```

#### Full Database Rollback
```bash
# Restore from backup
psql -U postgres -d hagumi < backup_20260509_120000.sql
```

### Rollback Checklist
- [ ] Identify migration to rollback
- [ ] Verify backup availability
- [ ] Test rollback in staging
- [ ] Notify users of downtime
- [ ] Execute rollback
- [ ] Verify data integrity
- [ ] Update application if needed

---

## Data Validation

### Validation Checks

#### Schema Validation
```sql
-- Check table structure
\d pets

-- Check constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'pets'::regclass;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'pets';
```

#### Data Validation
```sql
-- Check row counts
SELECT COUNT(*) FROM pets;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM sessions;

-- Check data integrity
SELECT user_id, COUNT(*) 
FROM pets 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Check for NULL values
SELECT COUNT(*) FROM pets WHERE name IS NULL;
SELECT COUNT(*) FROM pets WHERE user_id IS NULL;
```

#### Performance Validation
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM pets WHERE user_id = '...';

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```

### Validation Scripts

```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "hagumi/game-loop/db"
)

func validateData(ctx context.Context, database *db.Database) error {
    pool := database.GetPool()
    
    // Check connection
    if err := database.Ping(ctx); err != nil {
        return fmt.Errorf("database connection failed: %w", err)
    }
    
    // Check table existence
    var tableExists bool
    err := pool.QueryRow(ctx, 
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pets')").
        Scan(&tableExists)
    if err != nil {
        return fmt.Errorf("failed to check table existence: %w", err)
    }
    
    if !tableExists {
        return fmt.Errorf("pets table does not exist")
    }
    
    // Check row counts
    var petCount int
    err = pool.QueryRow(ctx, "SELECT COUNT(*) FROM pets").Scan(&petCount)
    if err != nil {
        return fmt.Errorf("failed to count pets: %w", err)
    }
    
    log.Printf("Validation passed: %d pets in database", petCount)
    return nil
}
```

---

## Troubleshooting

### Common Issues

#### Migration Already Applied
**Error**: `duplicate key value violates unique constraint "schema_migrations_version_key"`

**Solution**:
```bash
# Check migration status
go run backend/cmd/migrate.go status

# Migration is already applied, no action needed
```

#### Connection Timeout
**Error**: `connection timeout`

**Solution**:
```bash
# Check database connectivity
psql -U postgres -h localhost -d hagumi -c "SELECT 1"

# Check database server status
systemctl status postgresql
```

#### Permission Denied
**Error**: `permission denied for table pets`

**Solution**:
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE hagumi TO hagumi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hagumi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hagumi_user;
```

#### Lock Timeout
**Error**: `lock timeout`

**Solution**:
```sql
-- Check for active locks
SELECT * FROM pg_locks WHERE relation = 'pets'::regclass;

-- Kill blocking queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
AND pid != pg_backend_pid();
```

### Debug Mode

Enable debug logging:

```go
// In main.go
log.SetFlags(log.LstdFlags | log.Lshortfile)
```

### Migration Logs

Check migration logs:

```bash
# View application logs
tail -f /var/log/hagumi/migrations.log

# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

---

## Best Practices

### Migration Development

1. **Keep Migrations Small**
   - One change per migration
   - Avoid combining multiple changes
   - Test each migration independently

2. **Make Migrations Reversible**
   - Always provide down SQL
   - Test rollback procedures
   - Document rollback steps

3. **Use Transactions**
   - Wrap migrations in transactions
   - Rollback on failure
   - Ensure atomicity

4. **Add Comments**
   ```sql
   -- Migration: Add email index to users table
   -- Reason: Improve login performance
   -- Date: 2026-05-09
   CREATE INDEX idx_users_email ON users(email);
   ```

### Production Migrations

1. **Schedule During Low Traffic**
   - Run migrations during off-peak hours
   - Notify users in advance
   - Have rollback plan ready

2. **Use Blue-Green Deployment**
   - Deploy to new environment first
   - Test thoroughly
   - Switch traffic when ready

3. **Monitor Closely**
   - Watch for errors
   - Monitor performance
   - Check application logs

4. **Document Everything**
   - Record migration details
   - Note any issues encountered
   - Document lessons learned

### Data Safety

1. **Always Backup First**
   ```bash
   # Full database backup
   pg_dump -U postgres -d hagumi -F c -b -v -f backup_$(date +%Y%m%d_%H%M%S).backup
   ```

2. **Test in Staging**
   - Run migrations in staging first
   - Verify data integrity
   - Test application functionality

3. **Monitor Performance**
   - Watch query performance
   - Check for slow queries
   - Monitor resource usage

4. **Have Rollback Plan**
   - Know how to rollback
   - Test rollback procedures
   - Document rollback steps

---

## Migration Templates

### Create Table Template
```sql
-- Migration: Create [table_name] table
-- Description: [description]
-- Version: [version]

CREATE TABLE [table_name] (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    [column1] [type] [constraints],
    [column2] [type] [constraints],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_[table_name]_[column] ON [table_name]([column]);

-- Create triggers
CREATE TRIGGER update_[table_name]_updated_at
    BEFORE UPDATE ON [table_name]
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Add Column Template
```sql
-- Migration: Add [column_name] to [table_name]
-- Description: [description]
-- Version: [version]

ALTER TABLE [table_name]
ADD COLUMN [column_name] [type] [constraints];

-- Add comment
COMMENT ON COLUMN [table_name].[column_name] IS '[comment]';
```

### Create Index Template
```sql
-- Migration: Create index on [table_name].[column]
-- Description: [description]
-- Version: [version]

CREATE INDEX idx_[table_name]_[column] ON [table_name]([column]);

-- For composite index
CREATE INDEX idx_[table_name]_[col1]_[col2] ON [table_name]([col1], [col2]);
```

---

## Emergency Procedures

### Migration Failure Recovery

1. **Stop Application**
   ```bash
   # Stop all application instances
   systemctl stop hagumi-backend
   ```

2. **Assess Situation**
   ```bash
   # Check migration status
   go run backend/cmd/migrate.go status
   
   # Check database logs
   tail -100 /var/log/postgresql/postgresql.log
   ```

3. **Rollback if Needed**
   ```bash
   # Rollback last migration
   go run backend/cmd/migrate.go down
   
   # Or restore from backup
   psql -U postgres -d hagumi < backup_20260509_120000.sql
   ```

4. **Restart Application**
   ```bash
   # Start application
   systemctl start hagumi-backend
   
   # Verify health
   curl http://localhost:3001/health
   ```

### Data Corruption Recovery

1. **Identify Corruption**
   ```sql
   -- Check for corrupted data
   SELECT * FROM pets WHERE name IS NULL;
   SELECT * FROM pets WHERE user_id IS NULL;
   ```

2. **Repair Data**
   ```sql
   -- Fix NULL values
   UPDATE pets SET name = 'Unknown' WHERE name IS NULL;
   
   -- Fix orphaned records
   DELETE FROM pets WHERE user_id NOT IN (SELECT id FROM users);
   ```

3. **Verify Repairs**
   ```sql
   -- Verify no more issues
   SELECT COUNT(*) FROM pets WHERE name IS NULL;
   SELECT COUNT(*) FROM pets WHERE user_id IS NULL;
   ```

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgx Documentation](https://github.com/jackc/pgx)
- [Database Migration Best Practices](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Transaction Management](https://www.postgresql.org/docs/current/tutorial-transactions.html)

---

## Support

For migration issues or questions:
- Check logs: `/var/log/hagumi/migrations.log`
- Check database logs: `/var/log/postgresql/`
- Contact DBA team: dba@hagumi.com
- Create issue: [GitHub Issues](https://github.com/hagumi/hagumi-app/issues)