package validation

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// Validator provides input validation functions
type Validator struct {
	emailRegex    *regexp.Regexp
	usernameRegex *regexp.Regexp
	petNameRegex  *regexp.Regexp
}

// NewValidator creates a new validator
func NewValidator() *Validator {
	return &Validator{
		emailRegex:    regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`),
		usernameRegex: regexp.MustCompile(`^[a-zA-Z0-9_-]{3,30}$`),
		petNameRegex:  regexp.MustCompile(`^[a-zA-Z0-9\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\s]{1,20}$`),
	}
}

// ValidateEmail validates an email address
func (v *Validator) ValidateEmail(email string) error {
	if email == "" {
		return &ValidationError{Field: "email", Message: "email is required"}
	}
	
	email = strings.TrimSpace(email)
	if len(email) > 255 {
		return &ValidationError{Field: "email", Message: "email is too long (max 255 characters)"}
	}
	
	if !v.emailRegex.MatchString(email) {
		return &ValidationError{Field: "email", Message: "invalid email format"}
	}
	
	return nil
}

// ValidatePassword validates a password
func (v *Validator) ValidatePassword(password string) error {
	if password == "" {
		return &ValidationError{Field: "password", Message: "password is required"}
	}
	
	if len(password) < 8 {
		return &ValidationError{Field: "password", Message: "password must be at least 8 characters"}
	}
	
	if len(password) > 128 {
		return &ValidationError{Field: "password", Message: "password is too long (max 128 characters)"}
	}
	
	var (
		hasUpper   bool
		hasLower   bool
		hasNumber  bool
		hasSpecial bool
	)
	
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}
	
	if !hasUpper {
		return &ValidationError{Field: "password", Message: "password must contain at least one uppercase letter"}
	}
	if !hasLower {
		return &ValidationError{Field: "password", Message: "password must contain at least one lowercase letter"}
	}
	if !hasNumber {
		return &ValidationError{Field: "password", Message: "password must contain at least one number"}
	}
	if !hasSpecial {
		return &ValidationError{Field: "password", Message: "password must contain at least one special character"}
	}
	
	return nil
}

// ValidateUsername validates a username
func (v *Validator) ValidateUsername(username string) error {
	if username == "" {
		return &ValidationError{Field: "username", Message: "username is required"}
	}
	
	username = strings.TrimSpace(username)
	if len(username) < 3 {
		return &ValidationError{Field: "username", Message: "username must be at least 3 characters"}
	}
	
	if len(username) > 30 {
		return &ValidationError{Field: "username", Message: "username is too long (max 30 characters)"}
	}
	
	if !v.usernameRegex.MatchString(username) {
		return &ValidationError{Field: "username", Message: "username can only contain letters, numbers, underscores, and hyphens"}
	}
	
	return nil
}

// ValidatePetName validates a pet name
func (v *Validator) ValidatePetName(name string) error {
	if name == "" {
		return &ValidationError{Field: "petName", Message: "pet name is required"}
	}
	
	name = strings.TrimSpace(name)
	if len(name) < 1 {
		return &ValidationError{Field: "petName", Message: "pet name must be at least 1 character"}
	}
	
	if len(name) > 20 {
		return &ValidationError{Field: "petName", Message: "pet name is too long (max 20 characters)"}
	}
	
	if !v.petNameRegex.MatchString(name) {
		return &ValidationError{Field: "petName", Message: "pet name contains invalid characters"}
	}
	
	return nil
}

// ValidatePetID validates a pet ID
func (v *Validator) ValidatePetID(petID string) error {
	if petID == "" {
		return &ValidationError{Field: "petId", Message: "pet ID is required"}
	}
	
	if len(petID) < 1 || len(petID) > 100 {
		return &ValidationError{Field: "petId", Message: "invalid pet ID length"}
	}
	
	// Check for common injection patterns
	if strings.Contains(petID, "'") || strings.Contains(petID, "\"") || 
	   strings.Contains(petID, ";") || strings.Contains(petID, "--") {
		return &ValidationError{Field: "petId", Message: "invalid pet ID format"}
	}
	
	return nil
}

// ValidateAction validates a game action
func (v *Validator) ValidateAction(action string) error {
	if action == "" {
		return &ValidationError{Field: "action", Message: "action is required"}
	}
	
	validActions := map[string]bool{
		"feed":  true,
		"play":  true,
		"rest":  true,
		"clean": true,
	}
	
	if !validActions[action] {
		return &ValidationError{Field: "action", Message: "invalid action"}
	}
	
	return nil
}

// ValidateUserID validates a user ID
func (v *Validator) ValidateUserID(userID string) error {
	if userID == "" {
		return &ValidationError{Field: "userId", Message: "user ID is required"}
	}
	
	if len(userID) < 1 || len(userID) > 100 {
		return &ValidationError{Field: "userId", Message: "invalid user ID length"}
	}
	
	return nil
}

// ValidateString validates a generic string field
func (v *Validator) ValidateString(field, value string, minLength, maxLength int) error {
	if value == "" {
		return &ValidationError{Field: field, Message: fmt.Sprintf("%s is required", field)}
	}
	
	value = strings.TrimSpace(value)
	if len(value) < minLength {
		return &ValidationError{Field: field, Message: fmt.Sprintf("%s must be at least %d characters", field, minLength)}
	}
	
	if len(value) > maxLength {
		return &ValidationError{Field: field, Message: fmt.Sprintf("%s is too long (max %d characters)", field, maxLength)}
	}
	
	return nil
}

// ValidateInt validates an integer field
func (v *Validator) ValidateInt(field string, value int, min, max int) error {
	if value < min {
		return &ValidationError{Field: field, Message: fmt.Sprintf("%s must be at least %d", field, min)}
	}
	
	if value > max {
		return &ValidationError{Field: field, Message: fmt.Sprintf("%s must be at most %d", field, max)}
	}
	
	return nil
}

// ValidateFloat validates a float field
func (v *Validator) ValidateFloat(field string, value float64, min, max float64) error {
	if value < min {
		return &ValidationError{Field: field, Message: fmt.Sprintf("%s must be at least %.2f", field, min)}
	}
	
	if value > max {
		return &ValidationError{Field: field, Message: fmt.Sprintf("%s must be at most %.2f", field, max)}
	}
	
	return nil
}

// ValidateStats validates pet stats
func (v *Validator) ValidateStats(hunger, mood, energy, health int) error {
	if err := v.ValidateInt("hunger", hunger, 0, 100); err != nil {
		return err
	}
	if err := v.ValidateInt("mood", mood, 0, 100); err != nil {
		return err
	}
	if err := v.ValidateInt("energy", energy, 0, 100); err != nil {
		return err
	}
	if err := v.ValidateInt("health", health, 0, 100); err != nil {
		return err
	}
	return nil
}

// ValidateGenetics validates pet genetics
func (v *Validator) ValidateGenetics(baseHungerRate, baseMoodRate, baseEnergyRate, growthSpeed float64, personality string) error {
	if err := v.ValidateFloat("baseHungerRate", baseHungerRate, 0.1, 2.0); err != nil {
		return err
	}
	if err := v.ValidateFloat("baseMoodRate", baseMoodRate, 0.1, 2.0); err != nil {
		return err
	}
	if err := v.ValidateFloat("baseEnergyRate", baseEnergyRate, 0.1, 2.0); err != nil {
		return err
	}
	if err := v.ValidateFloat("growthSpeed", growthSpeed, 0.1, 2.0); err != nil {
		return err
	}
	
	validPersonalities := map[string]bool{
		"playful":      true,
		"calm":         true,
		"energetic":    true,
		"grumpy":       true,
		"affectionate": true,
		"lazy":         true,
		"curious":      true,
		"brave":        true,
	}
	
	if !validPersonalities[personality] {
		return &ValidationError{Field: "personality", Message: "invalid personality type"}
	}
	
	return nil
}

// ValidateWebSocketMessage validates a WebSocket message
func (v *Validator) ValidateWebSocketMessage(msgType string, payload []byte) error {
	if msgType == "" {
		return errors.New("message type is required")
	}
	
	// Check payload size
	if len(payload) > 1024*10 { // 10KB limit
		return errors.New("payload is too large (max 10KB)")
	}
	
	// Validate message type
	validTypes := map[string]bool{
		"pet:action":     true,
		"pet:register":   true,
		"pet:state":      true,
		"pet:update":     true,
		"auth:login":     true,
		"auth:logout":    true,
		"auth:refresh":   true,
	}
	
	if !validTypes[msgType] {
		return fmt.Errorf("invalid message type: %s", msgType)
	}
	
	return nil
}

// ValidateMultiple validates multiple fields and returns all errors
func (v *Validator) ValidateMultiple(validations []error) []error {
	var errors []error
	for _, err := range validations {
		if err != nil {
			errors = append(errors, err)
		}
	}
	return errors
}