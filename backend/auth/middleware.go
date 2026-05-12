package auth

import (
	"context"
	"net/http"
	"strings"
	"time"
)

// ContextKey is the type for context keys
type ContextKey string

const (
	UserIDKey  ContextKey = "user_id"
	EmailKey   ContextKey = "email"
	TokenKey   ContextKey = "token"
)

// AuthMiddleware provides authentication middleware
type AuthMiddleware struct {
	jwtManager    *JWTManager
	supabaseClient *SupabaseClient
}

// NewAuthMiddleware creates a new auth middleware
func NewAuthMiddleware(jwtManager *JWTManager, supabaseClient *SupabaseClient) *AuthMiddleware {
	return &AuthMiddleware{
		jwtManager:    jwtManager,
		supabaseClient: supabaseClient,
	}
}

// AuthenticateWebSocket authenticates WebSocket connections
func (m *AuthMiddleware) AuthenticateWebSocket(r *http.Request) (context.Context, error) {
	// Get token from query parameter
	token := r.URL.Query().Get("token")
	if token == "" {
		return nil, ErrMissingToken
	}

	// Verify JWT token
	claims, err := m.jwtManager.Verify(token)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Optionally verify with Supabase for extra security
	// This adds a small overhead but provides double verification
	_, err = m.supabaseClient.VerifyToken(token)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Add user info to context
	ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
	ctx = context.WithValue(ctx, EmailKey, claims.Email)
	ctx = context.WithValue(ctx, TokenKey, token)

	return ctx, nil
}

// AuthenticateHTTP authenticates HTTP requests
func (m *AuthMiddleware) AuthenticateHTTP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		// Extract token from "Bearer <token>"
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		// Verify JWT token
		claims, err := m.jwtManager.Verify(token)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Optionally verify with Supabase
		_, err = m.supabaseClient.VerifyToken(token)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Add user info to context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, EmailKey, claims.Email)
		ctx = context.WithValue(ctx, TokenKey, token)

		// Call next handler with updated context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserID extracts user ID from context
func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}

// GetEmail extracts email from context
func GetEmail(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(EmailKey).(string)
	return email, ok
}

// GetToken extracts token from context
func GetToken(ctx context.Context) (string, bool) {
	token, ok := ctx.Value(TokenKey).(string)
	return token, ok
}

// Auth errors
var (
	ErrMissingToken = &AuthError{
		Code:    "MISSING_TOKEN",
		Message: "Authentication token is required",
		Status:  http.StatusUnauthorized,
	}
	ErrInvalidToken = &AuthError{
		Code:    "INVALID_TOKEN",
		Message: "Invalid or expired token",
		Status:  http.StatusUnauthorized,
	}
	ErrUnauthorized = &AuthError{
		Code:    "UNAUTHORIZED",
		Message: "Unauthorized access",
		Status:  http.StatusUnauthorized,
	}
)

// AuthError represents an authentication error
type AuthError struct {
	Code    string
	Message string
	Status  int
}

func (e *AuthError) Error() string {
	return e.Message
}

// SessionManager manages user sessions
type SessionManager struct {
	sessions map[string]*Session
	jwtManager *JWTManager
}

// Session represents a user session
type Session struct {
	UserID      string
	Email       string
	Token       string
	RefreshToken string
	ExpiresAt   time.Time
	CreatedAt   time.Time
	LastActive  time.Time
}

// NewSessionManager creates a new session manager
func NewSessionManager(jwtManager *JWTManager) *SessionManager {
	return &SessionManager{
		sessions:   make(map[string]*Session),
		jwtManager: jwtManager,
	}
}

// CreateSession creates a new session
func (sm *SessionManager) CreateSession(userID, email, accessToken, refreshToken string, expiresIn int) *Session {
	now := time.Now()
	expiresAt := now.Add(time.Duration(expiresIn) * time.Second)

	session := &Session{
		UserID:       userID,
		Email:        email,
		Token:        accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		CreatedAt:    now,
		LastActive:   now,
	}

	sm.sessions[userID] = session
	return session
}

// GetSession retrieves a session by user ID
func (sm *SessionManager) GetSession(userID string) (*Session, bool) {
	session, exists := sm.sessions[userID]
	if !exists {
		return nil, false
	}

	// Check if session is expired
	if time.Now().After(session.ExpiresAt) {
		delete(sm.sessions, userID)
		return nil, false
	}

	// Update last active time
	session.LastActive = time.Now()
	return session, true
}

// DeleteSession deletes a session
func (sm *SessionManager) DeleteSession(userID string) {
	delete(sm.sessions, userID)
}

// RefreshSession refreshes a session with new tokens
func (sm *SessionManager) RefreshSession(userID, newAccessToken, newRefreshToken string, expiresIn int) (*Session, error) {
	session, exists := sm.GetSession(userID)
	if !exists {
		return nil, ErrUnauthorized
	}

	now := time.Now()
	expiresAt := now.Add(time.Duration(expiresIn) * time.Second)

	session.Token = newAccessToken
	session.RefreshToken = newRefreshToken
	session.ExpiresAt = expiresAt
	session.LastActive = now

	return session, nil
}

// CleanupExpiredSessions removes expired sessions
func (sm *SessionManager) CleanupExpiredSessions() {
	now := time.Now()
	for userID, session := range sm.sessions {
		if now.After(session.ExpiresAt) {
			delete(sm.sessions, userID)
		}
	}
}

// GetActiveSessionCount returns the number of active sessions
func (sm *SessionManager) GetActiveSessionCount() int {
	return len(sm.sessions)
}