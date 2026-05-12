package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

// RefreshRequest represents a token refresh request
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// RefreshResponse represents a token refresh response
type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

// TokenRefreshHandler handles token refresh requests
type TokenRefreshHandler struct {
	supabaseClient *SupabaseClient
	sessionManager *SessionManager
}

// NewTokenRefreshHandler creates a new token refresh handler
func NewTokenRefreshHandler(supabaseClient *SupabaseClient, sessionManager *SessionManager) *TokenRefreshHandler {
	return &TokenRefreshHandler{
		supabaseClient: supabaseClient,
		sessionManager: sessionManager,
	}
}

// HandleRefresh handles token refresh requests
func (h *TokenRefreshHandler) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Refresh token with Supabase
	authResp, err := h.supabaseClient.RefreshToken(req.RefreshToken)
	if err != nil {
		log.Printf("[Refresh] Failed to refresh token: %v", err)
		http.Error(w, "Failed to refresh token", http.StatusUnauthorized)
		return
	}

	// Update session if exists
	if authResp.User != nil {
		_, exists := h.sessionManager.GetSession(authResp.User.ID)
		if exists {
			_, err = h.sessionManager.RefreshSession(
				authResp.User.ID,
				authResp.AccessToken,
				authResp.RefreshToken,
				authResp.ExpiresIn,
			)
			if err != nil {
				log.Printf("[Refresh] Failed to update session: %v", err)
			} else {
				log.Printf("[Refresh] Session refreshed for user %s", authResp.User.ID)
			}
		}
	}

	// Return new tokens
	response := RefreshResponse{
		AccessToken:  authResp.AccessToken,
		RefreshToken: authResp.RefreshToken,
		ExpiresIn:    authResp.ExpiresIn,
		TokenType:    authResp.TokenType,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// AutoRefresh automatically refreshes tokens before they expire
type AutoRefresh struct {
	supabaseClient *SupabaseClient
	sessionManager *SessionManager
	refreshBefore  time.Duration
	stopChan       chan struct{}
}

// NewAutoRefresh creates a new auto-refresh manager
func NewAutoRefresh(supabaseClient *SupabaseClient, sessionManager *SessionManager, refreshBefore time.Duration) *AutoRefresh {
	return &AutoRefresh{
		supabaseClient: supabaseClient,
		sessionManager: sessionManager,
		refreshBefore:  refreshBefore,
		stopChan:       make(chan struct{}),
	}
}

// Start starts the auto-refresh process
func (ar *AutoRefresh) Start() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			ar.checkAndRefreshSessions()
		case <-ar.stopChan:
			log.Println("[AutoRefresh] Stopping auto-refresh")
			return
		}
	}
}

// Stop stops the auto-refresh process
func (ar *AutoRefresh) Stop() {
	close(ar.stopChan)
}

// checkAndRefreshSessions checks and refreshes expiring sessions
func (ar *AutoRefresh) checkAndRefreshSessions() {
	now := time.Now()
	
	// This would need access to all sessions
	// For now, we'll just log the check
	log.Printf("[AutoRefresh] Checking sessions at %s", now.Format(time.RFC3339))
	
	// In a real implementation, you would:
	// 1. Iterate through all sessions
	// 2. Check if any session expires within refreshBefore duration
	// 3. Refresh those sessions
	// 4. Update the session with new tokens
}

// TokenValidator validates tokens and handles refresh
type TokenValidator struct {
	jwtManager     *JWTManager
	supabaseClient *SupabaseClient
	sessionManager *SessionManager
}

// NewTokenValidator creates a new token validator
func NewTokenValidator(jwtManager *JWTManager, supabaseClient *SupabaseClient, sessionManager *SessionManager) *TokenValidator {
	return &TokenValidator{
		jwtManager:     jwtManager,
		supabaseClient: supabaseClient,
		sessionManager: sessionManager,
	}
}

// ValidateAndRefresh validates a token and refreshes if needed
func (tv *TokenValidator) ValidateAndRefresh(token string) (string, error) {
	// Try to verify JWT token
	claims, err := tv.jwtManager.Verify(token)
	if err == nil {
		// Token is valid, return it
		return token, nil
	}

	// Token is invalid or expired, try to refresh
	// Get session to get refresh token
	session, exists := tv.sessionManager.GetSession(claims.UserID)
	if !exists {
		return "", ErrInvalidToken
	}

	// Refresh token
	authResp, err := tv.supabaseClient.RefreshToken(session.RefreshToken)
	if err != nil {
		return "", err
	}

	// Update session
	_, err = tv.sessionManager.RefreshSession(
		authResp.User.ID,
		authResp.AccessToken,
		authResp.RefreshToken,
		authResp.ExpiresIn,
	)
	if err != nil {
		return "", err
	}

	// Return new access token
	return authResp.AccessToken, nil
}

// LogoutHandler handles logout requests
type LogoutHandler struct {
	sessionManager *SessionManager
}

// NewLogoutHandler creates a new logout handler
func NewLogoutHandler(sessionManager *SessionManager) *LogoutHandler {
	return &LogoutHandler{
		sessionManager: sessionManager,
	}
}

// HandleLogout handles logout requests
func (h *LogoutHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userID, ok := GetUserID(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Delete session
	h.sessionManager.DeleteSession(userID)

	log.Printf("[Logout] User %s logged out", userID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged out successfully",
	})
}