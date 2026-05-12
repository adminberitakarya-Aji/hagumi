package logging

import (
	"net/http"
)

// LoggerInterface defines the interface for logging operations
type LoggerInterface interface {
	// Error logs an error with request context
	Error(err error, r *http.Request)
	
	// Panic logs a panic with request context
	Panic(err interface{}, r *http.Request)
	
	// ErrorWithFields logs an error with additional fields
	ErrorWithFields(err error, fields map[string]interface{})
	
	// InfoWithFields logs an info message with fields
	InfoWithFields(message string, fields map[string]interface{})
	
	// WarningWithFields logs a warning message with fields
	WarningWithFields(message string, fields map[string]interface{})
	
	// DebugWithFields logs a debug message with fields
	DebugWithFields(message string, fields map[string]interface{})
	
	// Info logs an info message
	Info(message string)
	
	// Warning logs a warning message
	Warning(message string)
	
	// Debug logs a debug message
	Debug(message string)
	
	// Close closes the logger
	Close() error
}