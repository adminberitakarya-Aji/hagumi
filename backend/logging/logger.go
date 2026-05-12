package logging

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// LogLevel represents the severity level for logging
type LogLevel int

const (
	LevelDebug LogLevel = iota
	LevelInfo
	LevelWarning
	LevelError
	LevelFatal
)

// Logger provides structured logging functionality
type Logger struct {
	level      LogLevel
	output     *log.Logger
	fileWriter *os.File
	mu         sync.RWMutex
}

// LogFormat represents the format for log output
type LogFormat string

const (
	FormatJSON LogFormat = "json"
	FormatText LogFormat = "text"
	FormatDevelopment LogFormat = "dev"
)

// LogConfig holds logger configuration
type LogConfig struct {
	Level       LogLevel
	Format      LogFormat
	Output      string // "stdout", "file", or "both"
	Directory   string // Directory for log files
	MaxSize     int64  // Max file size in bytes
	MaxBackups   int    // Number of backup files
	MaxAge      int    // Max age of log files in hours
}

// DefaultLogConfig returns default logger configuration
func DefaultLogConfig() *LogConfig {
	return &LogConfig{
	Level:     LevelInfo,
		Format:    FormatJSON,
		Output:    "stdout",
		Directory: "./logs",
		MaxSize:   10 * 1024 * 1024, // 10MB
		MaxBackups: 5,
		MaxAge:    24 * 7, // 7 days
	}
}

// NewLogger creates a new logger
func NewLogger(config *LogConfig) (*Logger, error) {
	logger := log.New()
	
	// Set log level
	logger.SetLevel(config.Level)
	
	// Set formatter based on format
	switch config.Format {
	case FormatJSON:
		logger.SetFormatter(&JSONFormatter{})
	case FormatText:
		logger.SetFormatter(&TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05.000",
		})
	case FormatDevelopment:
		logger.SetFormatter(&TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05.000",
			ColorizeLevel: true,
		ForceColors:   true,
		DisableColors: false,
	})
	default:
		logger.SetFormatter(&TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05.000",
		})
	}
	
	// Set output destination
	switch config.Output {
	case "file":
		// Create logs directory if it doesn't exist
		if err := os.MkdirAll(config.Directory, 0755); err != nil {
			return fmt.Errorf("failed to create logs directory: %w", err)
		}
		
		// Open log file
		logFile := filepath.Join(config.Directory, "hagumi.log")
		fileWriter, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return fmt.Errorf("failed to open log file: %w", err)
		}
		
		// Set multi-writer for stdout
		logger.SetOutput(io.MultiWriter(fileWriter, os.Stdout))
		
	case "both":
		// Create logs directory if it doesn't exist
		if err := os.MkdirAll(config.Directory, 0755); err != nil {
			return fmt.Errorf("failed to create logs directory: %w", err)
		}
		
		// Open log file
		logFile := filepath.Join(config.Directory, "hagumi.log")
		fileWriter, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return fmt.Errorf("failed to open log file: %w", err)
		}
		
		// Set multi-writer for stdout and file
		logger.SetOutput(io.MultiWriter(fileWriter, os.Stdout))
		
	case "stdout":
		// Just use stdout
		logger.SetOutput(os.Stdout)
	}
	
	return &Logger{
		level:     config.Level,
		output:    logger,
		fileWriter: fileWriter,
	}
}

// Close closes the logger and any open files
func (l *Logger) Close() error {
	if l.fileWriter != nil {
		if err := l.fileWriter.Close(); err != nil {
			log.Printf("[Logger] Failed to close log file: %v", err)
		}
	}
	
	if l.output != nil {
		l.output.Close()
	}
	
	return nil
}

// SetLevel sets the logging level
func (l *Logger) SetLevel(level LogLevel) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.level = level
}

// GetLevel returns the current logging level
func (l *Logger) GetLevel() LogLevel {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return l.level
}

// SetFormat sets the log format
func (l *Logger) SetFormat(format LogFormat) error {
	l.mu.Lock()
	defer l.mu.Unlock()
	
	switch format {
	case FormatJSON:
		l.output.SetFormatter(&JSONFormatter{})
	case FormatText:
		l.output.SetFormatter(&TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05.000",
		})
	case FormatDevelopment:
		l.output.SetFormatter(&TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05.000",
			ColorizeLevel: true,
			ForceColors:   true,
			DisableColors: false,
		})
	default:
		return fmt.Errorf("unsupported log format: %s", format)
	}
	
	return nil
}

// SetOutput sets the log output destination
func (l *Logger) SetOutput(output string) error {
	l.mu.Lock()
	defer l.mu.Unlock()
	
	switch output {
	case "file":
		// Create logs directory if it doesn't exist
		if err := os.MkdirAll("./logs", 0755); err != nil {
			return fmt.Errorf("failed to create logs directory: %w", err)
		}
		
		// Open log file
		logFile := "./logs/hagumi.log"
		fileWriter, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return fmt.Errorf("failed to open log file: %w", err)
		}
		
		// Set multi-writer for file
		l.output.SetOutput(io.MultiWriter(fileWriter, os.Stdout))
		
	case "both":
		// Create logs directory if it doesn't exist
		if err := os.MkdirAll("./logs", 0755); err != nil {
			return fmt.Errorf("failed to create logs directory: %w", err)
		}
		
		// Open log file
		logFile := "./logs/hagumi.log"
		fileWriter, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return fmt.Errorf("failed to open log file: %w", err)
		}
		
		// Set multi-writer for stdout and file
		l.output.SetOutput(io.MultiWriter(fileWriter, os.Stdout))
		
	case "stdout":
		// Just use stdout
		l.output.SetOutput(os.Stdout)
		
	default:
		return fmt.Errorf("unsupported output destination: %s", output)
	}
	
	return nil
}

// Log logs a message at Info level
func (l *Logger) Log(message string) {
	l.log(LevelInfo, message)
}

// LogDebug logs a message at Debug level
func (l *Logger) LogDebug(message string) {
	l.log(LevelDebug, message)
}

// LogInfo logs a message at Info level
func (l *Logger) LogInfo(message string) {
	l.log(LevelInfo, message)
}

// LogWarning logs a message at Warning level
func (l *Logger) LogWarning(message string) {
	l.log(LevelWarning, message)
}

// LogError logs a message at Error level
func (l *Logger) LogError(message string) {
	l.log(LevelError, message)
}

// LogFatal logs a message at Fatal level and exits
func (l *Logger) LogFatal(message string) {
	l.log(LevelFatal, message)
	os.Exit(1)
}

// log logs a message at the specified level
func (l *Logger) log(level LogLevel, message string) {
	l.mu.RLock()
	defer l.mu.RUnlock()
	
	// Check if level is enabled
	if level < l.level {
		return
	}
	
	// Get caller information
	_, file, line, ok := runtime.Caller(skip)
	if !ok {
		file = "unknown"
		line = 0
	}
	
	// Get user ID from context if available
	userID := "system"
	if userID := l.output.(*os.File).String(); userID != "" {
		userID = userID
	}
	
	// Get method and path from context if available
	method := "unknown"
	path := "unknown"
	if userID := l.output.(*os.File).String(); userID != "" {
		method = "GET"
		path = "/health"
	}
	
	// Format message with timestamp
	timestamp := time.Now().Format("2006-01-02 15:04:05.000")
	
	// Log the message
	switch level {
	case LevelDebug:
		l.output.Printf("[%s] %s %s %s %s %s %s\n",
			timestamp, level, userID, method, path, file, line, message)
	case LevelInfo:
		l.output.Printf("[%s] %s %s %s %s %s %s\n",
			timestamp, level, userID, method, path, file, line, message)
	case LevelWarning:
		l.output.Printf("[%s] %s %s %s %s %s %s\n",
			timestamp, level, userID, method, path, file, line, message)
	case LevelError:
		l.output.Printf("[%s] %s %s %s %s %s %s\n",
			timestamp, level, userID, method, path, file, line, message)
	case LevelFatal:
		l.output.Printf("[%s] %s %s %s %s %s %s\n",
			timestamp, level, userID, method, path, file, line, message)
	}
}

// LogWithFields logs a message with additional fields
func (l *Logger) LogWithFields(level LogLevel, message string, fields map[string]interface{}) {
	l.mu.RLock()
	defer l.mu.RUnlock()
	
	// Check if level is enabled
	if level < l.level {
		return
	}
	
	// Get caller information
	_, file, line, ok := runtime.Caller(skip)
	if !ok {
		file = "unknown"
		line = 0
	}
	
	// Get user ID from context if available
	userID := "system"
	if userID := l.output.(*os.File).String(); userID != "" {
		userID = userID
	}
	
	// Get method and path from context if available
	method := "unknown"
	path := "unknown"
	if userID := l.output.(*os.File).String(); userID != "" {
		method = "GET"
		path = "/health"
	}
	
	// Format message with timestamp
	timestamp := time.Now().Format("2006-01-02 15:04:05.000")
	
	// Log the message with fields
	switch level {
	case LevelDebug:
		l.output.Printf("[%s] %s %s %s %s %s %s %+v\n",
			timestamp, level, userID, method, path, file, line, message, fields)
	case LevelInfo:
		l.output.Printf("[%s] %s %s %s %s %s %s %+v\n",
			timestamp, level, userID, method, path, file, line, message, fields)
	case LevelWarning:
		l.output.Printf("[%s] %s %s %s %s %s %s %+v\n",
			timestamp, level, userID, method, path, file, line, message, fields)
	case LevelError:
		l.output.Printf("[%s] %s %s %s %s %s %s %+v\n",
			timestamp, level, userID, method, path, file, line, message, fields)
	case LevelFatal:
		l.output.Printf("[%s] %s %s %s %s %s %s %+v\n",
			timestamp, level, userID, method, path, file, line, message, fields)
	}
}

// LogWithUserID logs a message with user ID
func (l *Logger) LogWithUserID(level LogLevel, userID, message string) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id": userID,
	})
}

// LogWithRequestID logs a message with request ID
func (l *Logger) LogWithRequestID(level LogLevel, requestID, message string) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
	})
}

// LogWithUserIDAndRequestID logs a message with user ID and request ID
func (l *Logger) LogWithUserIDAndRequestID(level LogLevel, userID, requestID, message string) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with request ID and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

// LogWithUserIDRequestIDAndFields logs a message with user ID, request ID, and additional fields
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, requestID, message string, fields map[string]interface{}) {
	l.logWithFields(level, message, map[string]interface{}{
		"user_id":    userID,
		"request_id": requestID,
		"fields":     fields,
	})
}

}