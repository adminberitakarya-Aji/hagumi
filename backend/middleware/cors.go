package middleware

import (
	"net/http"
	"strconv"
	"strings"
)

// CORSConfig holds CORS configuration
type CORSConfig struct {
	AllowedOrigins   []string
	AllowedMethods   []string
	AllowedHeaders   []string
	ExposedHeaders   []string
	AllowCredentials bool
	MaxAge           int
}

// DefaultCORSConfig returns default CORS configuration
func DefaultCORSConfig() *CORSConfig {
	return &CORSConfig{
		AllowedOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:3000",
		},
		AllowedMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowedHeaders: []string{
			"Accept",
			"Accept-Encoding",
			"Authorization",
			"Content-Type",
			"Origin",
			"X-CSRF-Token",
			"X-Requested-With",
		},
		ExposedHeaders: []string{
			"Content-Length",
			"Content-Type",
			"X-RateLimit-Limit",
			"X-RateLimit-Remaining",
			"X-RateLimit-Reset",
		},
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours
	}
}

// ProductionCORSConfig returns production CORS configuration
func ProductionCORSConfig(allowedOrigins []string) *CORSConfig {
	return &CORSConfig{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Accept-Encoding", "Authorization", "Content-Type", "Origin", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           86400,
	}
}

// CORSMiddleware creates CORS middleware
func CORSMiddleware(config *CORSConfig) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			
			// Check if origin is allowed
			allowed := false
			for _, allowedOrigin := range config.AllowedOrigins {
				if allowedOrigin == "*" || allowedOrigin == origin {
					allowed = true
					break
				}
				
				// Support wildcard subdomains
				if strings.HasPrefix(allowedOrigin, "*.") {
					domain := strings.TrimPrefix(allowedOrigin, "*.")
					if strings.HasSuffix(origin, domain) {
						allowed = true
						break
					}
				}
			}
			
			if allowed {
				// Set CORS headers
				if config.AllowedOrigins[0] == "*" {
					w.Header().Set("Access-Control-Allow-Origin", "*")
				} else {
					w.Header().Set("Access-Control-Allow-Origin", origin)
				}
				
				if config.AllowCredentials {
					w.Header().Set("Access-Control-Allow-Credentials", "true")
				}
				
				if len(config.AllowedMethods) > 0 {
					w.Header().Set("Access-Control-Allow-Methods", strings.Join(config.AllowedMethods, ", "))
				}
				
				if len(config.AllowedHeaders) > 0 {
					w.Header().Set("Access-Control-Allow-Headers", strings.Join(config.AllowedHeaders, ", "))
				}
				
				if len(config.ExposedHeaders) > 0 {
					w.Header().Set("Access-Control-Expose-Headers", strings.Join(config.ExposedHeaders, ", "))
				}
				
				if config.MaxAge > 0 {
					w.Header().Set("Access-Control-Max-Age", strconv.Itoa(config.MaxAge))
				}

			}
			
			// Handle preflight requests
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}
}

// SecurityHeadersMiddleware adds security headers to responses
func SecurityHeadersMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Prevent clickjacking
			w.Header().Set("X-Frame-Options", "DENY")
			
			// Prevent MIME type sniffing
			w.Header().Set("X-Content-Type-Options", "nosniff")
			
			// Enable XSS protection
			w.Header().Set("X-XSS-Protection", "1; mode=block")
			
			// Strict Transport Security (only for HTTPS)
			if r.URL.Scheme == "https" {
				w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
			}
			
			// Content Security Policy
			w.Header().Set("Content-Security-Policy", 
				"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline' 'unsafe-eval'; "+
				"style-src 'self' 'unsafe-inline'; "+
				"img-src 'self' data: https:; "+
				"font-src 'self' data:; "+
				"connect-src 'self' wss://localhost:3001; "+
				"frame-ancestors 'none';")
			
			// Referrer Policy
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
			
			// Permissions Policy
			w.Header().Set("Permissions-Policy", 
				"geolocation=(), "+
				"microphone=(), "+
				"camera=(), "+
				"payment=(), "+
				"usb=()")
			
			next.ServeHTTP(w, r)
		})
	}
}

// NoCacheMiddleware adds cache control headers to prevent caching
func NoCacheMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Expires", "0")
			
			next.ServeHTTP(w, r)
		})
	}
}

// CacheControlMiddleware adds cache control headers
func CacheControlMiddleware(maxAge int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				w.Header().Set("Cache-Control", "public, max-age="+strconv.Itoa(maxAge))
			} else {

				w.Header().Set("Cache-Control", "no-store")
			}
			
			next.ServeHTTP(w, r)
		})
	}
}