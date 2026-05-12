package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// SupabaseClient handles Supabase authentication
type SupabaseClient struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

// NewSupabaseClient creates a new Supabase client
func NewSupabaseClient() *SupabaseClient {
	baseURL := os.Getenv("SUPABASE_URL")
	apiKey := os.Getenv("SUPABASE_ANON_KEY")

	if baseURL == "" {
		baseURL = "https://your-project.supabase.co"
	}
	if apiKey == "" {
		apiKey = "your-anon-key"
	}

	return &SupabaseClient{
		baseURL:    baseURL,
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}
}

// SupabaseUser represents a Supabase user
type SupabaseUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_confirmed_at"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

// SupabaseAuthResponse represents Supabase auth response
type SupabaseAuthResponse struct {
	User         *SupabaseUser `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresIn    int           `json:"expires_in"`
	TokenType    string        `json:"token_type"`
}

// SupabaseError represents Supabase error response
type SupabaseError struct {
	Message string `json:"message"`
	Status  int    `json:"status"`
}

// LoginRequest represents login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterRequest represents register request
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login authenticates a user with Supabase
func (client *SupabaseClient) Login(email, password string) (*SupabaseAuthResponse, error) {
	url := fmt.Sprintf("%s/auth/v1/token?grant_type=password", client.baseURL)

	reqBody := LoginRequest{
		Email:    email,
		Password: password,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", client.apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", client.apiKey))

	resp, err := client.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var supabaseErr SupabaseError
		if err := json.Unmarshal(body, &supabaseErr); err != nil {
			return nil, fmt.Errorf("authentication failed: %s", string(body))
		}
		return nil, fmt.Errorf("authentication failed: %s", supabaseErr.Message)
	}

	var authResp SupabaseAuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &authResp, nil
}

// Register creates a new user in Supabase
func (client *SupabaseClient) Register(email, password string) (*SupabaseAuthResponse, error) {
	url := fmt.Sprintf("%s/auth/v1/signup", client.baseURL)

	reqBody := RegisterRequest{
		Email:    email,
		Password: password,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", client.apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", client.apiKey))

	resp, err := client.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var supabaseErr SupabaseError
		if err := json.Unmarshal(body, &supabaseErr); err != nil {
			return nil, fmt.Errorf("registration failed: %s", string(body))
		}
		return nil, fmt.Errorf("registration failed: %s", supabaseErr.Message)
	}

	var authResp SupabaseAuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &authResp, nil
}

// VerifyToken verifies a Supabase access token
func (client *SupabaseClient) VerifyToken(accessToken string) (*SupabaseUser, error) {
	url := fmt.Sprintf("%s/auth/v1/user", client.baseURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", client.apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	resp, err := client.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var supabaseErr SupabaseError
		if err := json.Unmarshal(body, &supabaseErr); err != nil {
			return nil, fmt.Errorf("token verification failed: %s", string(body))
		}
		return nil, fmt.Errorf("token verification failed: %s", supabaseErr.Message)
	}

	var user SupabaseUser
	if err := json.Unmarshal(body, &user); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &user, nil
}

// RefreshToken refreshes an access token using a refresh token
func (client *SupabaseClient) RefreshToken(refreshToken string) (*SupabaseAuthResponse, error) {
	url := fmt.Sprintf("%s/auth/v1/token?grant_type=refresh_token", client.baseURL)

	reqBody := map[string]string{
		"refresh_token": refreshToken,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", client.apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", client.apiKey))

	resp, err := client.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var supabaseErr SupabaseError
		if err := json.Unmarshal(body, &supabaseErr); err != nil {
			return nil, fmt.Errorf("token refresh failed: %s", string(body))
		}
		return nil, fmt.Errorf("token refresh failed: %s", supabaseErr.Message)
	}

	var authResp SupabaseAuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &authResp, nil
}