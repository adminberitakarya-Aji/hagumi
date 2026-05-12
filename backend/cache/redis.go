package cache

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// CacheService wraps the Redis client to provide simple caching operations
type CacheService struct {
	Client *redis.Client
}

// NewCacheService initializes a new Redis connection
func NewCacheService(redisURL string) *CacheService {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("[Redis] Failed to parse Redis URL: %v. Using defaults.", err)
		opts = &redis.Options{
			Addr: "localhost:6379",
		}
	}

	client := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("[Redis] Warning: Could not connect to Redis: %v", err)
	} else {
		log.Println("[Redis] Successfully connected to Cache Server")
	}

	return &CacheService{Client: client}
}

// Set stores a key-value pair with an expiration time
func (s *CacheService) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return s.Client.Set(ctx, key, data, expiration).Err()
}

// Get retrieves a value by key and unmarshals it into the provided dest pointer
func (s *CacheService) Get(ctx context.Context, key string, dest interface{}) error {
	data, err := s.Client.Get(ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

// Delete removes a key from the cache (Cache Invalidation)
func (s *CacheService) Delete(ctx context.Context, key string) error {
	return s.Client.Del(ctx, key).Err()
}

// PrefixDelete removes all keys matching a prefix pattern
func (s *CacheService) PrefixDelete(ctx context.Context, prefix string) error {
	var cursor uint64
	for {
		var keys []string
		var err error
		keys, cursor, err = s.Client.Scan(ctx, cursor, prefix+"*", 100).Result()
		if err != nil {
			return err
		}
		if len(keys) > 0 {
			if err := s.Client.Del(ctx, keys...).Err(); err != nil {
				return err
			}
		}
		if cursor == 0 {
			break
		}
	}
	return nil
}
