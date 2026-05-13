package errors

import (
	"encoding/json"
	"fmt"
	"net/http"
	"runtime/debug"
	
	"github.com/hagumi/game-loop/logging"
)

// ErrorHandler handles HTTP error responses
type ErrorHandler struct {
	logger *logging.Logger
}

// NewErrorHandler creates a new error handler
func NewErrorHandler(logger *logging.Logger) *ErrorHandler {
	return &ErrorHandler{
		logger: logger,
	}
}

// Handle handles errors and returns appropriate HTTP responses
func (h *ErrorHandler) Handle(w http.ResponseWriter, r *http.Request, err error) {
	// Convert error to our custom Error type
	var customErr *Error
	if customErr, ok := err.(*Error); ok {
		h.handleError(w, r, customErr)
		return
	}

	// Create error from standard error
	customErr = NewErrorFromError(err)
	h.handleError(w, r, customErr)
}

// handleError handles the error response
func (h *ErrorHandler) handleError(w http.ResponseWriter, r *http.Request, err *Error) {
	// Log the error
	h.logger.Error(err, r)

	// Set response headers
	w.Header().Set("Content-Type", "application/json")
	
	// Add security headers
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-XSS-Protection", "1; mode=block")

	// Add CORS headers if origin is present
	if origin := r.Header.Get("Origin"); origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	}

	// Set status code
	w.WriteHeader(err.StatusCode)

	// Write error response
	json.NewEncoder(w).Encode(err)
}

// HandlePanic recovers from panics
func (h *ErrorHandler) HandlePanic(w http.ResponseWriter, r *http.Request, err interface{}) {
	// Log the panic
	h.logger.Panic(err, r)

	// Convert panic to error
	var customErr *Error
	if customErr, ok := err.(*Error); ok {
		h.handleError(w, r, customErr)
		return
	}

	// Create error from panic
	stackTrace := string(debug.Stack())
	customErr = NewErrorWithDetails(
		ErrCodeInternalError,
		"Internal server error",
		fmt.Sprintf("Panic recovered: %v", err),
	).WithStackTrace(stackTrace)

	// Set 500 status for panics
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(customErr)
}

// LogError logs an error with context
func (h *ErrorHandler) LogError(err error, r *http.Request) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
		requestID = requestID.(string)
	}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log error with context
	h.logger.ErrorWithFields(err, map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
		"remote_addr": r.RemoteAddr,
		"user_agent":  r.UserAgent(),
	})
}

// LogErrorWithFields logs an error with additional fields
func (h *ErrorHandler) LogErrorWithFields(err error, r *http.Request, fields map[string]interface{}) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log error with context and fields
	h.logger.ErrorWithFields(err, map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
		"remote_addr": r.RemoteAddr,
		"user_agent":  r.UserAgent(),
		"fields":     fields,
	})
}

// LogPanic logs a panic with context
func (h *ErrorHandler) LogPanic(err interface{}, r *http.Request) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Get stack trace
	stackTrace := ""
	if err != nil {
		stackTrace = string(debug.Stack())
	}

	// Log panic with context
	h.logger.ErrorWithFields(fmt.Errorf("%v", err), map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
		"remote_addr": r.RemoteAddr,
		"user_agent": 	 r.UserAgent(),
		"stack_trace": stackTrace,
	})
}

// getMethod returns the HTTP method
func getMethod(r *http.Request) string {
	if r == nil {
		return "unknown"
	}
	return r.Method
}

// LogInfo logs an info message
func (h *ErrorHandler) LogInfo(message string, r *http.Request) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log info with context
	h.logger.InfoWithFields(message, map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
			"remote_addr": r.RemoteAddr,
		"user_agent":  r.UserAgent(),
	})
}

// LogInfoWithFields logs an info message with additional fields
func (h *ErrorHandler) LogInfoWithFields(message string, r *http.Request, fields map[string]interface{}) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log info with context and fields
	h.logger.InfoWithFields(message, map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
		"remote_addr": r.RemoteAddr,
		"user_agent":  r.UserAgent(),
		"fields":     fields,
	})
}

// LogWarning logs a warning message
func (h *ErrorHandler) LogWarning(message string, r *http.Request) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log warning with context
	h.logger.WarningWithFields(message, map[string]interface{}{
		"request_id": requestID,
			"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
		"remote_addr": r.RemoteAddr,
		"user_agent":  r.UserAgent(),
	})
}

// LogWarningWithFields logs a warning message with additional fields
func (h *ErrorHandler) LogWarningWithFields(message string, r *http.Request, fields map[string]interface{}) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log warning with context and fields
	h.logger.WarningWithFields(message, map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
			"remote_addr": r.RemoteAddr,
		"user_agent":  r.UserAgent(),
		"fields":     fields,
	})
}

// LogDebug logs a debug message
func (h *ErrorHandler) LogDebug(message string, r *http.Request) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log debug with context
	h.logger.DebugWithFields(message, map[string]interface{}{
		"request_id": requestID,
			"user_id":    userID,
		"method":     getMethod(r),
		"path":       r.URL.Path,
		"remote_addr": r.RemoteAddr,
		"user_agent":  r.UserAgent(),
	})
}

// LogDebugWithFields logs a debug message with additional fields
func (h *ErrorHandler) LogDebugWithFields(message string, r *http.Request, fields map[string]interface{}) {
	// Get request ID from context if available
	requestID := ""
	if r != nil {
		if requestID := r.Context().Value("request_id"); requestID != nil {
			requestID = requestID.(string)
		}
	}

	// Get user ID from context if available
	userID := ""
	if r != nil {
		if userID := r.Context().Value("user_id"); userID != nil {
			userID = userID.(string)
		}
	}

	// Log debug with context and fields
	h.logger.DebugWithFields(message, map[string]interface{}{
		"request_id": requestID,
		"user_id":    userID,
		"method":     getMethod(r),
			"path":       r.URL.Path,
			"remote_addr": r.RemoteAddr,
			"user_agent":  r.UserAgent(),
		"fields":     fields,
	})
}