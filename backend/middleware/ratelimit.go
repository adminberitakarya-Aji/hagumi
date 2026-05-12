package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"
)

// RateLimiter implements rate limiting per user/IP
type RateLimiter struct {
	clients map[string]*ClientLimiter
	mu      sync.RWMutex
	limit   int           // requests per window
	window  time.Duration // time window
}

// ClientLimiter tracks requests for a single client
type ClientLimiter struct {
	requests []time.Time
	mu       sync.Mutex
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*ClientLimiter),
		limit:   limit,
		window:  window,
	}
	
	// Start cleanup goroutine
	go rl.cleanup()
	
	return rl
}

// Allow checks if a request is allowed
func (rl *RateLimiter) Allow(clientID string) bool {
	rl.mu.RLock()
	client, exists := rl.clients[clientID]
	rl.mu.RUnlock()
	
	if !exists {
		rl.mu.Lock()
		client = &ClientLimiter{
			requests: make([]time.Time, 0),
		}
		rl.clients[clientID] = client
		rl.mu.Unlock()
	}
	
	client.mu.Lock()
	defer client.mu.Unlock()
	
	now := time.Now()
	
	// Remove old requests outside the window
	cutoff := now.Add(-rl.window)
	validRequests := make([]time.Time, 0)
	for _, reqTime := range client.requests {
		if reqTime.After(cutoff) {
			validRequests = append(validRequests, reqTime)
		}
	}
	client.requests = validRequests
	
	// Check if limit exceeded
	if len(client.requests) >= rl.limit {
		return false
	}
	
	// Add current request
	client.requests = append(client.requests, now)
	return true
}

// GetRemaining returns remaining requests for a client
func (rl *RateLimiter) GetRemaining(clientID string) int {
	rl.mu.RLock()
	client, exists := rl.clients[clientID]
	rl.mu.RUnlock()
	
	if !exists {
		return rl.limit
	}
	
	client.mu.Lock()
	defer client.mu.Unlock()
	
	now := time.Now()
	cutoff := now.Add(-rl.window)
	count := 0
	
	for _, reqTime := range client.requests {
		if reqTime.After(cutoff) {
			count++
		}
	}
	
	remaining := rl.limit - count
	if remaining < 0 {
		return 0
	}
	return remaining
}

// GetResetTime returns when the rate limit will reset
func (rl *RateLimiter) GetResetTime(clientID string) time.Time {
	rl.mu.RLock()
	client, exists := rl.clients[clientID]
	rl.mu.RUnlock()
	
	if !exists || len(client.requests) == 0 {
		return time.Now()
	}
	
	client.mu.Lock()
	defer client.mu.Unlock()
	
	oldestRequest := client.requests[0]
	return oldestRequest.Add(rl.window)
}

// cleanup removes old client entries
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		cutoff := now.Add(-rl.window)
		
		for clientID, client := range rl.clients {
			client.mu.Lock()
			if len(client.requests) == 0 || client.requests[len(client.requests)-1].Before(cutoff) {
				delete(rl.clients, clientID)
			}
			client.mu.Unlock()
		}
		rl.mu.Unlock()
	}
}

// RateLimitMiddleware creates rate limiting middleware
func RateLimitMiddleware(limiter *RateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get client ID from IP or user ID
			clientID := getClientID(r)
			
			// Check if request is allowed
			if !limiter.Allow(clientID) {
				remaining := limiter.GetRemaining(clientID)
				resetTime := limiter.GetResetTime(clientID)
				
				w.Header().Set("X-RateLimit-Limit", strconv.Itoa(limiter.limit))
				w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
				w.Header().Set("X-RateLimit-Reset", resetTime.Format(time.RFC3339))
				w.Header().Set("Retry-After", resetTime.Sub(time.Now()).String())
				
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}
			
			// Add rate limit headers
			remaining := limiter.GetRemaining(clientID)
			resetTime := limiter.GetResetTime(clientID)
			
			w.Header().Set("X-RateLimit-Limit", strconv.Itoa(limiter.limit))
			w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
			w.Header().Set("X-RateLimit-Reset", resetTime.Format(time.RFC3339))
			
			next.ServeHTTP(w, r)
		})
	}
}

// getClientID extracts client ID from request
func getClientID(r *http.Request) string {
	// Try to get from X-Forwarded-For header (behind proxy)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return xff
	}
	
	// Try to get from X-Real-IP header
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}
	
	// Fall back to RemoteAddr
	return r.RemoteAddr
}

// IPRateLimiter implements IP-based rate limiting
type IPRateLimiter struct {
	limiter *RateLimiter
}

// NewIPRateLimiter creates a new IP-based rate limiter
func NewIPRateLimiter(limit int, window time.Duration) *IPRateLimiter {
	return &IPRateLimiter{
		limiter: NewRateLimiter(limit, window),
	}
}

// Middleware returns the middleware function
func (irl *IPRateLimiter) Middleware() func(http.Handler) http.Handler {
	return RateLimitMiddleware(irl.limiter)
}

// UserRateLimiter implements user-based rate limiting
type UserRateLimiter struct {
	limiter *RateLimiter
}

// NewUserRateLimiter creates a new user-based rate limiter
func NewUserRateLimiter(limit int, window time.Duration) *UserRateLimiter {
	return &UserRateLimiter{
		limiter: NewRateLimiter(limit, window),
	}
}

// Middleware returns the middleware function
func (url *UserRateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user ID from context (set by auth middleware)
			userID := r.Context().Value("user_id")
			if userID == nil {
				// Fall back to IP if not authenticated
				userID = getClientID(r)
			}
			
			clientID := userID.(string)
			
			if !url.limiter.Allow(clientID) {
				remaining := url.limiter.GetRemaining(clientID)
				resetTime := url.limiter.GetResetTime(clientID)
				
				w.Header().Set("X-RateLimit-Limit", strconv.Itoa(url.limiter.limit))
				w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
				w.Header().Set("X-RateLimit-Reset", resetTime.Format(time.RFC3339))
				w.Header().Set("Retry-After", resetTime.Sub(time.Now()).String())
				
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}
			
			remaining := url.limiter.GetRemaining(clientID)
			resetTime := url.limiter.GetResetTime(clientID)
			
			w.Header().Set("X-RateLimit-Limit", strconv.Itoa(url.limiter.limit))
			w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
			w.Header().Set("X-RateLimit-Reset", resetTime.Format(time.RFC3339))
			
			next.ServeHTTP(w, r)
		})
	}
}

// RequestSizeLimiter limits the size of requests
type RequestSizeLimiter struct {
	maxSize int64
}

// NewRequestSizeLimiter creates a new request size limiter
func NewRequestSizeLimiter(maxSize int64) *RequestSizeLimiter {
	return &RequestSizeLimiter{
		maxSize: maxSize,
	}
}

// Middleware returns the middleware function
func (rsl *RequestSizeLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Check Content-Length header
			if contentLength := r.ContentLength; contentLength > rsl.maxSize {
				http.Error(w, "Request too large", http.StatusRequestEntityTooLarge)
				return
			}
			
			// Limit request body size
			r.Body = http.MaxBytesReader(w, r.Body, rsl.maxSize)
			
			next.ServeHTTP(w, r)
		})
	}
}