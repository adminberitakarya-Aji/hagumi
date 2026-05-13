package logging

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"sync"
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

func (l LogLevel) String() string {
	switch l {
	case LevelDebug:
		return "DEBUG"
	case LevelInfo:
		return "INFO"
	case LevelWarning:
		return "WARNING"
	case LevelError:
		return "ERROR"
	case LevelFatal:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

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
	FormatJSON        LogFormat = "json"
	FormatText        LogFormat = "text"
	FormatDevelopment LogFormat = "dev"
)

// LogConfig holds logger configuration
type LogConfig struct {
	Level      LogLevel
	Format     LogFormat
	Output     string // "stdout", "file", or "both"
	Directory  string // Directory for log files
	MaxSize    int64  // Max file size in bytes
	MaxBackups int    // Number of backup files
	MaxAge     int    // Max age of log files in hours
}

// DefaultLogConfig returns default logger configuration
func DefaultLogConfig() *LogConfig {
	return &LogConfig{
		Level:      LevelInfo,
		Format:     FormatJSON,
		Output:     "stdout",
		Directory:  "./logs",
		MaxSize:    10 * 1024 * 1024, // 10MB
		MaxBackups: 5,
		MaxAge:     24 * 7, // 7 days
	}
}

// NewLogger creates a new logger
func NewLogger(config *LogConfig) (*Logger, error) {
	var out io.Writer = os.Stdout

	var fileWriter *os.File
	if config.Output == "file" || config.Output == "both" {
		if err := os.MkdirAll(config.Directory, 0755); err != nil {
			return nil, fmt.Errorf("failed to create logs directory: %w", err)
		}
		logFile := filepath.Join(config.Directory, "hagumi.log")
		var err error
		fileWriter, err = os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return nil, fmt.Errorf("failed to open log file: %w", err)
		}

		if config.Output == "both" {
			out = io.MultiWriter(os.Stdout, fileWriter)
		} else {
			out = fileWriter
		}
	}

	return &Logger{
		level:      config.Level,
		output:     log.New(out, "", 0),
		fileWriter: fileWriter,
	}, nil
}

// Close closes the logger and any open files
func (l *Logger) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.fileWriter != nil {
		return l.fileWriter.Close()
	}
	return nil
}

// SetLevel sets the logging level
func (l *Logger) SetLevel(level LogLevel) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.level = level
}

// log handles the core logging logic
func (l *Logger) log(level LogLevel, message string, fields map[string]interface{}) {
	l.mu.RLock()
	if level < l.level {
		l.mu.RUnlock()
		return
	}
	l.mu.RUnlock()

	_, file, line, _ := runtime.Caller(2)
	
	entry := map[string]interface{}{
		"timestamp": time.Now().Format(time.RFC3339),
		"level":     level.String(),
		"message":   message,
		"file":      fmt.Sprintf("%s:%d", filepath.Base(file), line),
	}

	for k, v := range fields {
		entry[k] = v
	}

	data, _ := json.Marshal(entry)
	l.output.Println(string(data))
}

// Public logging methods
func (l *Logger) LogDebug(msg string) { l.log(LevelDebug, msg, nil) }
func (l *Logger) LogInfo(msg string)  { l.log(LevelInfo, msg, nil) }
func (l *Logger) LogWarning(msg string) { l.log(LevelWarning, msg, nil) }
func (l *Logger) LogError(msg string) { l.log(LevelError, msg, nil) }
func (l *Logger) LogFatal(msg string) {
	l.log(LevelFatal, msg, nil)
	os.Exit(1)
}

func (l *Logger) LogWithFields(level LogLevel, msg string, fields map[string]interface{}) {
	l.log(level, msg, fields)
}

// Compatibility methods for LoggerInterface
func (l *Logger) Info(msg string)    { l.LogInfo(msg) }
func (l *Logger) Warning(msg string) { l.LogWarning(msg) }
func (l *Logger) Debug(msg string)   { l.LogDebug(msg) }
func (l *Logger) Error(err error, r *http.Request) {
	fields := map[string]interface{}{}
	if r != nil {
		fields["method"] = r.Method
		fields["url"] = r.URL.String()
		fields["remote_addr"] = r.RemoteAddr
	}
	l.log(LevelError, err.Error(), fields)
}
func (l *Logger) Panic(err interface{}, r *http.Request) {
	fields := map[string]interface{}{"panic": true}
	if r != nil {
		fields["method"] = r.Method
		fields["url"] = r.URL.String()
	}
	l.log(LevelError, fmt.Sprintf("%v", err), fields)
}
func (l *Logger) InfoWithFields(msg string, f map[string]interface{})    { l.log(LevelInfo, msg, f) }
func (l *Logger) WarningWithFields(msg string, f map[string]interface{}) { l.log(LevelWarning, msg, f) }
func (l *Logger) ErrorWithFields(err error, f map[string]interface{})    { l.log(LevelError, err.Error(), f) }
func (l *Logger) DebugWithFields(msg string, f map[string]interface{})   { l.log(LevelDebug, msg, f) }

// Methods used in existing code
func (l *Logger) LogWithUserID(level LogLevel, userID, msg string) {
	l.log(level, msg, map[string]interface{}{"user_id": userID})
}
func (l *Logger) LogWithRequestID(level LogLevel, reqID, msg string) {
	l.log(level, msg, map[string]interface{}{"request_id": reqID})
}
func (l *Logger) LogWithUserIDAndRequestID(level LogLevel, userID, reqID, msg string) {
	l.log(level, msg, map[string]interface{}{"user_id": userID, "request_id": reqID})
}
func (l *Logger) LogWithUserIDRequestIDAndFields(level LogLevel, userID, reqID, msg string, f map[string]interface{}) {
	if f == nil { f = make(map[string]interface{}) }
	f["user_id"] = userID
	f["request_id"] = reqID
	l.log(level, msg, f)
}
func (l *Logger) LogWithUserIDAndFields(level LogLevel, userID, msg string, f map[string]interface{}) {
	if f == nil { f = make(map[string]interface{}) }
	f["user_id"] = userID
	l.log(level, msg, f)
}
func (l *Logger) LogWithRequestIDAndFields(level LogLevel, reqID, msg string, f map[string]interface{}) {
	if f == nil { f = make(map[string]interface{}) }
	f["request_id"] = reqID
	l.log(level, msg, f)
}

// For context-based logging
func (l *Logger) WithContext(ctx context.Context) *Logger {
	return l // Placeholder
}