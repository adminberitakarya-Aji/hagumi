package errors

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// ErrorCode represents a unique error code
type ErrorCode string

const (
	// Authentication errors
	ErrCodeAuthRequired ErrorCode = "AUTH_REQUIRED"
	ErrCodeInvalidToken ErrorCode = "INVALID_TOKEN"
	ErrCodeUnauthorized ErrorCode = "UNAUTHORIZED"
	ErrCodeSessionExpired ErrorCode = "SESSION_EXPIRED"
	
	// Validation errors
	ErrCodeValidation ErrorCode = "VALIDATION_ERROR"
	ErrCodeInvalidInput ErrorCode = "INVALID_INPUT"
	ErrCodeInvalidFormat ErrorCode = "INVALID_FORMAT"
	ErrCodeMissingField ErrorCode = "MISSING_FIELD"
	ErrCodeValueOutOfRange ErrorCode = "VALUE_OUT_OF_RANGE"
	
	// Database errors
	ErrCodeDatabaseError ErrorCode = "DATABASE_ERROR"
	ErrCodeConnectionFailed ErrorCode = "CONNECTION_FAILED"
	ErrCodeQueryFailed ErrorCode = "QUERY_FAILED"
	ErrCodeTransactionFailed ErrorCode = "TRANSACTION_FAILED"
	ErrCodeRecordNotFound ErrorCode = "RECORD_NOT_FOUND"
	ErrCodeDuplicateRecord ErrorCode = "DUPLICATE_RECORD"
	ErrCodeConstraintViolation ErrorCode = "CONSTRAINT_VIOLATION"
	
	// WebSocket errors
	ErrCodeWebSocketError ErrorCode = "WEBSOCKET_ERROR"
	ErrCodeConnectionLost ErrorCode = "CONNECTION_LOST"
	ErrCodeInvalidMessage ErrorCode = "INVALID_MESSAGE"
	ErrCodeMessageTooLarge ErrorCode = "MESSAGE_TOO_LARGE"
	
	// Business logic errors
	ErrCodeBusinessLogic ErrorCode = "BUSINESS_LOGIC"
	ErrCodeInvalidAction ErrorCode = "INVALID_ACTION"
	ErrCodeInvalidState ErrorCode = "INVALID_STATE"
	ErrCodeResourceNotFound ErrorCode = "RESOURCE_NOT_FOUND"
	ErrCodeOperationNotAllowed ErrorCode = "OPERATION_NOT_ALLOWED"
	
	// System errors
	ErrCodeInternalError ErrorCode = "INTERNAL_ERROR"
	ErrCodeServiceUnavailable ErrorCode = "SERVICE_UNAVAILABLE"
	ErrCodeTimeout ErrorCode = "TIMEOUT"
	ErrCodeRateLimitExceeded ErrorCode = "RATE_LIMIT_EXCEEDED"
	ErrCodeRequestTooLarge ErrorCode = "REQUEST_TOO_LARGE"
	
	// Configuration errors
	ErrCodeConfigError ErrorCode = "CONFIG_ERROR"
	ErrCodeInvalidConfig ErrorCode = "INVALID_CONFIG"
)

// ErrorSeverity represents the severity level of an error
type ErrorSeverity string

const (
	SeverityLow      ErrorSeverity = "low"
	SeverityMedium    ErrorSeverity = "medium"
	SeverityHigh     ErrorSeverity = "high"
	SeverityCritical ErrorSeverity = "critical"
)

// ErrorCategory represents the category of an error
type ErrorCategory string

const (
	CategoryAuth       ErrorCategory = "auth"
	CategoryValidation  ErrorCategory = "validation"
	CategoryDatabase   ErrorCategory = "database"
	CategoryWebSocket ErrorCategory = "websocket"
	CategoryBusiness   ErrorCategory = "business"
	CategorySystem     ErrorCategory = "system"
	CategoryConfig     ErrorCategory = "config"
)

// Error represents an application error
type Error struct {
	Code       ErrorCode     `json:"code"`
	Message    string        `json:"message"`
	Details    string        `json:"details,omitempty"`
	Severity  ErrorSeverity `json:"severity"`
	Category  ErrorCategory `json:"category"`
	StatusCode int           `json:"statusCode"`
	StackTrace string        `json:"stackTrace,omitempty"`
	Fields     map[string]interface{} `json:"fields,omitempty"`
	Timestamp  time.Time     `json:"timestamp"`
	RequestID  string        `json:"requestId,omitempty"`
	UserID     string        `json:"userId,omitempty"`
}

// Error implements the error interface
func (e *Error) Error() string {
	if e.Details != "" {
		return fmt.Sprintf("[%s] %s: %s", e.Code, e.Severity, e.Message)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Unwrap allows unwrapping the wrapped error
func (e *Error) Unwrap() error {
	if e.Details != "" {
		return fmt.Errorf("%s: %s", e.Message, e.Details)
	}
	return fmt.Errorf("%s", e.Message)
}

// NewError creates a new error
func NewError(code ErrorCode, message string) *Error {
	return &Error{
		Code:       code,
		Message:    message,
		Severity:  getDefaultSeverity(code),
		Category:  getCategory(code),
		StatusCode: getDefaultStatusCode(code),
		Timestamp: time.Now(),
	}
}

// NewErrorWithDetails creates a new error with details
func NewErrorWithDetails(code ErrorCode, message, details string) *Error {
	return &Error{
		Code:       code,
		Message:    message,
		Details:    details,
		Severity:  getDefaultSeverity(code),
		Category:  getCategory(code),
		StatusCode: getDefaultStatusCode(code),
		Timestamp: time.Now(),
	}
}

// NewErrorWithFields creates a new error with additional fields
func NewErrorWithFields(code ErrorCode, message string, fields map[string]interface{}) *Error {
	return &Error{
		Code:       code,
		Message:    message,
		Severity:  getDefaultSeverity(code),
		Category:  getCategory(code),
		StatusCode: getDefaultStatusCode(code),
		Fields:     fields,
		Timestamp: time.Now(),
	}
}

// NewErrorWithSeverity creates a new error with custom severity
func NewErrorWithSeverity(code ErrorCode, message string, severity ErrorSeverity) *Error {
	return &Error{
		Code:       code,
		Message:    message,
		Severity:  severity,
		Category:  getCategory(code),
		StatusCode: getDefaultStatusCode(code),
		Timestamp: time.Now(),
	}
}

// NewErrorWithCategory creates a new error with custom category
func NewErrorWithCategory(code ErrorCode, message string, category ErrorCategory) *Error {
	return &Error{
		Code:       code,
		Message:    message,
		Severity:  getDefaultSeverity(code),
		Category:  category,
		StatusCode: getDefaultStatusCode(code),
		Timestamp: time.Now(),
	}
}

// NewErrorWithStatusCode creates a new error with custom status code
func NewErrorWithStatusCode(code ErrorCode, message string, statusCode int) *Error {
	return &Error{
		Code:       code,
		Message:    message,
		Severity:  getDefaultSeverity(code),
		Category: getCategory(code),
		StatusCode: statusCode,
		Timestamp: time.Now(),
	}
}

// NewErrorFromError creates an error from a standard Go error
func NewErrorFromError(err error) *Error {
	if err == nil {
		return nil
	}
	
	// Try to cast to our custom error type
	if customErr, ok := err.(*Error); ok {
		return customErr
	}
	
	// Create error from standard error
	return &Error{
		Code:       ErrCodeInternalError,
		Message:    err.Error(),
		Severity:  SeverityHigh,
		Category:  CategorySystem,
		StatusCode: http.StatusInternalServerError,
		Timestamp: time.Now(),
	}
}

// getDefaultSeverity returns the default severity for an error code
func getDefaultSeverity(code ErrorCode) ErrorSeverity {
	switch code {
	case ErrCodeAuthRequired, ErrCodeUnauthorized, ErrCodeSessionExpired:
		return SeverityHigh
	case ErrCodeInvalidToken, ErrCodeInvalidInput, ErrCodeInvalidFormat:
		return SeverityMedium
	case ErrCodeDatabaseError, ErrCodeConnectionFailed, ErrCodeQueryFailed:
		return SeverityHigh
	case ErrCodeRateLimitExceeded, ErrCodeRequestTooLarge:
		return SeverityMedium
	case ErrCodeInternalError, ErrCodeServiceUnavailable:
		return SeverityCritical
	case ErrCodeTimeout:
		return SeverityMedium
	default:
		return SeverityLow
	}
}

// getCategory returns the category for an error code
func getCategory(code ErrorCode) ErrorCategory {
	switch code {
	case ErrCodeAuthRequired, ErrCodeInvalidToken, ErrCodeUnauthorized, ErrCodeSessionExpired:
		return CategoryAuth
	case ErrCodeValidation, ErrCodeInvalidInput, ErrCodeInvalidFormat, ErrCodeMissingField, ErrCodeValueOutOfRange:
		return CategoryValidation
	case ErrCodeDatabaseError, ErrCodeConnectionFailed, ErrCodeQueryFailed, ErrCodeTransactionFailed, 
	     ErrCodeRecordNotFound, ErrCodeDuplicateRecord, ErrCodeConstraintViolation:
		return CategoryDatabase
	case ErrCodeWebSocketError, ErrCodeConnectionLost, ErrCodeInvalidMessage, ErrCodeMessageTooLarge:
		return CategoryWebSocket
	case ErrCodeBusinessLogic, ErrCodeInvalidAction, ErrCodeInvalidState, ErrCodeResourceNotFound, ErrCodeOperationNotAllowed:
		return CategoryBusiness
	case ErrCodeInternalError, ErrCodeServiceUnavailable, ErrCodeTimeout, ErrCodeRateLimitExceeded, ErrCodeRequestTooLarge:
		return CategorySystem
	case ErrCodeConfigError, ErrCodeInvalidConfig:
		return CategoryConfig
	default:
		return CategorySystem
	}
}

// getDefaultStatusCode returns the default HTTP status code for an error code
func getDefaultStatusCode(code ErrorCode) int {
	switch code {
	case ErrCodeAuthRequired, ErrCodeUnauthorized, ErrCodeSessionExpired:
		return http.StatusUnauthorized
	case ErrCodeInvalidToken, ErrCodeInvalidInput, ErrCodeInvalidFormat:
		return http.StatusBadRequest
	case ErrCodeDatabaseError, ErrCodeConnectionFailed, ErrCodeQueryFailed, ErrCodeTransactionFailed:
		return http.StatusInternalServerError
	case ErrCodeRecordNotFound, ErrCodeResourceNotFound:
		return http.StatusNotFound
	case ErrCodeDuplicateRecord, ErrCodeConstraintViolation:
		return http.StatusConflict
	case ErrCodeRateLimitExceeded:
		return http.StatusTooManyRequests
	case ErrCodeRequestTooLarge:
		return http.StatusRequestEntityTooLarge
	case ErrCodeServiceUnavailable:
		return http.StatusServiceUnavailable
	case ErrCodeTimeout:
		return http.StatusRequestTimeout
	case ErrCodeInternalError:
		return http.StatusInternalServerError
	case ErrCodeWebSocketError, ErrCodeConnectionLost:
		return http.StatusInternalServerError
	case ErrCodeInvalidMessage, ErrCodeMessageTooLarge:
		return http.StatusBadRequest
	case ErrCodeBusinessLogic, ErrCodeInvalidAction, ErrCodeInvalidState, ErrCodeOperationNotAllowed:
		return http.StatusBadRequest
	case ErrCodeConfigError, ErrCodeInvalidConfig:
		return http.StatusInternalServerError
	default:
		return http.StatusInternalServerError
	}
}

// IsCritical checks if an error is critical
func (e *Error) IsCritical() bool {
	return e.Severity == SeverityCritical
}

// IsHigh checks if an error is high severity
func (e *Error) IsHigh() bool {
	return e.Severity == SeverityHigh || e.IsCritical()
}

// IsMedium checks if an error is medium severity
func (e *Error) IsMedium() bool {
	return e.Severity == SeverityMedium || e.IsHigh()
}

// IsLow checks if an error is low severity
func (e *Error) IsLow() bool {
	return e.Severity == SeverityLow || e.IsMedium()
}

// WithField adds a field to the error
func (e *Error) WithField(key string, value interface{}) *Error {
	if e.Fields == nil {
		e.Fields = make(map[string]interface{})
	}
	e.Fields[key] = value
	return e
}

// WithFields adds multiple fields to the error
func (e *Error) WithFields(fields map[string]interface{}) *Error {
	if e.Fields == nil {
		e.Fields = make(map[string]interface{})
	}
	for key, value := range fields {
		e.Fields[key] = value
	}
	return e
}

// WithRequestID adds request ID to the error
func (e *Error) WithRequestID(requestID string) *Error {
	e.RequestID = requestID
	return e
}

// WithUserID adds user ID to the error
func (e *Error) WithUserID(userID string) *Error {
	e.UserID = userID
	return e
}

// WithStackTrace adds stack trace to the error
func (e *Error) WithStackTrace(stackTrace string) *Error {
	e.StackTrace = stackTrace
	return e
}

// ToJSON converts the error to JSON
func (e *Error) ToJSON() ([]byte, error) {
	return json.Marshal(e)
}

// String returns the error as string
func (e *Error) String() string {
	return e.Error()
}