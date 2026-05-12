# Error Handling & Recovery Guide

## Overview

This guide covers the comprehensive error handling system implemented in HAGUMI-APP for both backend and frontend. The system provides structured error handling, logging, recovery mechanisms, and user-friendly error displays.

## Table of Contents

1. [Backend Error Handling](#backend-error-handling)
2. [Frontend Error Handling](#frontend-error-handling)
3. [Error Codes](#error-codes)
4. [Best Practices](#best-practices)
5. [Examples](#examples)

---

## Backend Error Handling

### Architecture

The backend error handling system consists of:

- **Error Types** (`backend/errors/types.go`): Custom error types with codes, severity, and categories
- **Error Handler** (`backend/errors/handler.go`): HTTP error response handler
- **Logger Interface** (`backend/logging/interface.go`): Logging interface for error reporting
- **Logger** (`backend/logging/logger.go`): Structured logging implementation

### Error Structure

```go
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
```

### Creating Errors

```go
// Simple error
err := errors.NewError(errors.ErrCodeValidation, "Invalid input")

// Error with details
err := errors.NewErrorWithDetails(
    errors.ErrCodeDatabaseError,
    "Failed to connect to database",
    "Connection timeout after 30 seconds",
)

// Error with custom fields
err := errors.NewErrorWithFields(
    errors.ErrCodeBusinessLogic,
    "Invalid action",
    map[string]interface{}{
        "action": "delete_pet",
        "pet_id": "123",
    },
)

// Error from standard Go error
err := errors.NewErrorFromError(stdErr)
```

### Error Handling in HTTP Handlers

```go
func (h *Handler) SomeHandler(w http.ResponseWriter, r *http.Request) {
    defer func() {
        if err := recover(); err != nil {
            h.errorHandler.HandlePanic(w, r, err)
        }
    }()

    // Your handler logic
    if someCondition {
        err := errors.NewError(errors.ErrCodeValidation, "Invalid input")
        h.errorHandler.Handle(w, r, err)
        return
    }

    // Success response
    json.NewEncoder(w).Encode(response)
}
```

### Error Severity Levels

- **Low**: Informational errors that don't affect functionality
- **Medium**: Errors that affect some functionality but can be recovered
- **High**: Critical errors that affect core functionality
- **Critical**: System-level errors that require immediate attention

### Error Categories

- **Auth**: Authentication and authorization errors
- **Validation**: Input validation errors
- **Database**: Database operation errors
- **WebSocket**: WebSocket connection errors
- **Business**: Business logic errors
- **System**: System-level errors
- **Config**: Configuration errors

---

## Frontend Error Handling

### Architecture

The frontend error handling system consists of:

- **ErrorBoundary** (`src/shared/error/ErrorBoundary.tsx`): React error boundary component
- **ErrorFallback** (`src/shared/error/ErrorFallback.tsx`): User-friendly error display
- **ErrorContext** (`src/shared/error/ErrorContext.tsx`): Global error state management
- **Error Handler** (`src/shared/error/errorHandler.ts`): Error utilities and helpers

### Using ErrorBoundary

Wrap your application or specific components with ErrorBoundary:

```tsx
import { ErrorBoundary } from '@/shared/error';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling
        console.error('Error caught:', error, errorInfo);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Using ErrorContext

Wrap your app with ErrorProvider for global error state:

```tsx
import { ErrorProvider } from '@/shared/error';

function App() {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <YourApp />
      </ErrorBoundary>
    </ErrorProvider>
  );
}
```

### Using Error Hooks

```tsx
import { useError, useErrorMessage, useHasError } from '@/shared/error';

function MyComponent() {
  const { error, showError, clearError } = useError();
  const errorMessage = useErrorMessage();
  const hasError = useHasError();

  const handleAction = async () => {
    try {
      // Your async operation
      await someAsyncOperation();
    } catch (err) {
      showError(
        ErrorCode.NETWORK_ERROR,
        'Failed to connect to server',
        err.message
      );
    }
  };

  return (
    <div>
      {hasError && (
        <div className="error">
          {errorMessage}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      <button onClick={handleAction}>Perform Action</button>
    </div>
  );
}
```

### Error Utilities

```tsx
import {
  createError,
  logError,
  withErrorHandling,
  getUserFriendlyMessage,
  ErrorCode,
} from '@/shared/error';

// Create an error
const error = createError(
  ErrorCode.VALIDATION_ERROR,
  'Invalid email format',
  'Email must contain @ symbol'
);

// Log an error
logError(error, {
  userId: '123',
  requestId: 'abc-123',
  path: '/api/pets',
});

// Wrap async function with error handling
const { data, error } = await withErrorHandling(
  async () => {
    return await fetchPets();
  },
  { userId: '123' }
);

if (error) {
  console.error('Failed to fetch pets:', error);
} else {
  console.log('Pets:', data);
}

// Get user-friendly message
const message = getUserFriendlyMessage(error);
console.log(message); // "Please check your input and try again"
```

### Retry with Exponential Backoff

```tsx
import { createRetryFunction } from '@/shared/error';

async function fetchData() {
  return await fetch('/api/data').then(res => res.json());
}

// Retry up to 3 times with exponential backoff
const data = await createRetryFunction(fetchData, 3, 1000);
```

---

## Error Codes

### Authentication Errors

| Code | Description | Severity |
|------|-------------|----------|
| `AUTH_REQUIRED` | Authentication required | High |
| `INVALID_TOKEN` | Invalid authentication token | Medium |
| `UNAUTHORIZED` | User not authorized | High |
| `SESSION_EXPIRED` | Session has expired | High |

### Validation Errors

| Code | Description | Severity |
|------|-------------|----------|
| `VALIDATION_ERROR` | General validation error | Medium |
| `INVALID_INPUT` | Invalid input provided | Medium |
| `INVALID_FORMAT` | Invalid format | Medium |
| `MISSING_FIELD` | Required field is missing | Medium |
| `VALUE_OUT_OF_RANGE` | Value is out of valid range | Medium |

### Network Errors

| Code | Description | Severity |
|------|-------------|----------|
| `NETWORK_ERROR` | Network error occurred | High |
| `CONNECTION_FAILED` | Failed to connect to server | High |
| `TIMEOUT` | Request timed out | Medium |

### API Errors

| Code | Description | Severity |
|------|-------------|----------|
| `API_ERROR` | General API error | Medium |
| `SERVER_ERROR` | Server error occurred | High |
| `NOT_FOUND` | Resource not found | Medium |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Medium |

### Business Logic Errors

| Code | Description | Severity |
|------|-------------|----------|
| `BUSINESS_LOGIC` | Business logic error | Low |
| `INVALID_ACTION` | Invalid action performed | Medium |
| `INVALID_STATE` | Invalid state for operation | Medium |
| `RESOURCE_NOT_FOUND` | Resource not found | Medium |
| `OPERATION_NOT_ALLOWED` | Operation not allowed | Medium |

### System Errors

| Code | Description | Severity |
|------|-------------|----------|
| `INTERNAL_ERROR` | Internal server error | Critical |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Critical |

---

## Best Practices

### Backend

1. **Always use custom error types**: Use `errors.NewError()` instead of standard Go errors
2. **Provide meaningful error messages**: Include context about what went wrong
3. **Use appropriate error codes**: Choose the most specific error code for the situation
4. **Log errors with context**: Include request ID, user ID, and other relevant information
5. **Handle panics gracefully**: Use defer/recover in HTTP handlers
6. **Don't expose sensitive information**: Keep error messages user-friendly
7. **Use structured logging**: Log errors in a structured format for easy parsing

### Frontend

1. **Wrap components with ErrorBoundary**: Catch errors at appropriate levels
2. **Use ErrorContext for global state**: Manage errors centrally
3. **Show user-friendly messages**: Translate error codes to helpful messages
4. **Provide recovery options**: Allow users to retry or navigate away
5. **Log errors for debugging**: Send errors to error reporting service
6. **Handle network errors gracefully**: Show appropriate UI for network issues
7. **Don't crash the app**: Always have fallback UI for errors

### General

1. **Be consistent**: Use the same error handling patterns throughout the codebase
2. **Document error codes**: Keep error codes documented and up to date
3. **Monitor errors**: Set up error monitoring and alerting
4. **Test error scenarios**: Write tests for error handling paths
5. **Review errors regularly**: Analyze error logs to identify common issues

---

## Examples

### Example 1: API Endpoint with Error Handling

```go
func (h *Handler) CreatePet(w http.ResponseWriter, r *http.Request) {
    defer func() {
        if err := recover(); err != nil {
            h.errorHandler.HandlePanic(w, r, err)
        }
    }()

    // Validate input
    var req CreatePetRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        err := errors.NewErrorWithDetails(
            errors.ErrCodeInvalidInput,
            "Invalid request body",
            err.Error(),
        )
        h.errorHandler.Handle(w, r, err)
        return
    }

    // Validate pet name
    if req.Name == "" {
        err := errors.NewError(
            errors.ErrCodeMissingField,
            "Pet name is required",
        )
        h.errorHandler.Handle(w, r, err)
        return
    }

    // Create pet
    pet, err := h.petService.CreatePet(req)
    if err != nil {
        h.errorHandler.Handle(w, r, err)
        return
    }

    // Return success
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(pet)
}
```

### Example 2: React Component with Error Handling

```tsx
import { useError, withErrorHandling, ErrorCode } from '@/shared/error';

function PetForm() {
  const { showError, clearError } = useError();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    const { data, error } = await withErrorHandling(
      async () => {
        const response = await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        return response.json();
      }
    );

    setLoading(false);

    if (error) {
      showError(
        ErrorCode.API_ERROR,
        'Failed to create pet',
        error.details
      );
    } else {
      console.log('Pet created:', data);
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Pet name"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Pet'}
      </button>
    </form>
  );
}
```

### Example 3: WebSocket Error Handling

```go
func (h *Handler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    // Upgrade to WebSocket
    conn, err := h.upgrader.Upgrade(w, r, nil)
    if err != nil {
        err := errors.NewErrorWithDetails(
            errors.ErrCodeWebSocketError,
            "Failed to upgrade connection",
            err.Error(),
        )
        h.errorHandler.Handle(w, r, err)
        return
    }
    defer conn.Close()

    // Handle messages
    for {
        messageType, message, err := conn.ReadMessage()
        if err != nil {
            err := errors.NewErrorWithDetails(
                errors.ErrCodeConnectionLost,
                "WebSocket connection lost",
                err.Error(),
            )
            h.errorHandler.LogError(err, r)
            break
        }

        // Process message
        if err := h.processMessage(message); err != nil {
            err := errors.NewErrorWithDetails(
                errors.ErrCodeInvalidMessage,
                "Invalid message format",
                err.Error(),
            )
            h.errorHandler.LogError(err, r)
            continue
        }

        // Send response
        if err := conn.WriteMessage(messageType, message); err != nil {
            err := errors.NewErrorWithDetails(
                errors.ErrCodeWebSocketError,
                "Failed to send message",
                err.Error(),
            )
            h.errorHandler.LogError(err, r)
            break
        }
    }
}
```

---

## Integration with Error Reporting Services

### Sentry Integration (Frontend)

```tsx
import * as Sentry from '@sentry/react';
import { ErrorBoundary } from '@/shared/error';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Custom ErrorBoundary with Sentry
function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Sentry Integration (Backend)

```go
import (
    "github.com/getsentry/sentry-go"
    "hagumi-app/backend/errors"
)

func (h *Handler) SomeHandler(w http.ResponseWriter, r *http.Request) {
    defer func() {
        if err := recover(); err != nil {
            // Capture panic in Sentry
            hub := sentry.GetHubFromContext(r.Context())
            if hub != nil {
                hub.CaptureException(err)
            }
            h.errorHandler.HandlePanic(w, r, err)
        }
    }()

    // Your handler logic
    if err := someOperation(); err != nil {
        // Capture error in Sentry
        hub := sentry.GetHubFromContext(r.Context())
        if hub != nil {
            hub.CaptureException(err)
        }
        h.errorHandler.Handle(w, r, err)
        return
    }
}
```

---

## Testing Error Handling

### Backend Testing

```go
func TestErrorHandler(t *testing.T) {
    logger := logging.NewLogger(logging.DefaultLogConfig())
    errorHandler := errors.NewErrorHandler(logger)

    t.Run("Handle validation error", func(t *testing.T) {
        err := errors.NewError(errors.ErrCodeValidation, "Invalid input")
        
        w := httptest.NewRecorder()
        r := httptest.NewRequest("GET", "/test", nil)
        
        errorHandler.Handle(w, r, err)
        
        assert.Equal(t, http.StatusBadRequest, w.Code)
        
        var response errors.Error
        json.NewDecoder(w.Body).Decode(&response)
        
        assert.Equal(t, errors.ErrCodeValidation, response.Code)
        assert.Equal(t, "Invalid input", response.Message)
    })
}
```

### Frontend Testing

```tsx
import { renderHook, act } from '@testing-library/react';
import { ErrorProvider, useError } from '@/shared/error';

describe('useError', () => {
  it('should show and clear errors', () => {
    const wrapper = ({ children }) => (
      <ErrorProvider>{children}</ErrorProvider>
    );

    const { result } = renderHook(() => useError(), { wrapper });

    expect(result.current.error).toBeNull();

    act(() => {
      result.current.showError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid input'
      );
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Invalid input');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
```

---

## Monitoring and Alerting

### Error Metrics

Monitor the following metrics:

1. **Error Rate**: Number of errors per minute/hour
2. **Error Severity**: Distribution of error severity levels
3. **Error Categories**: Most common error categories
4. **Error Codes**: Most frequent error codes
5. **Response Time**: Time to handle errors

### Alerting Rules

Set up alerts for:

1. **Critical Errors**: Immediate alert for any critical errors
2. **High Error Rate**: Alert when error rate exceeds threshold
3. **Recurring Errors**: Alert for errors that occur repeatedly
4. **Service Degradation**: Alert when error rate affects service quality

---

## Troubleshooting

### Common Issues

1. **Error not being caught**: Ensure ErrorBoundary wraps the component
2. **Error not logging**: Check logger configuration and permissions
3. **Error not displaying**: Verify ErrorContext is properly set up
4. **Error not recovering**: Check if error is marked as recoverable

### Debug Mode

Enable debug mode for detailed error information:

```typescript
// Frontend
const isDevelopment = process.env.NODE_ENV === 'development';

// Backend
config := logging.DefaultLogConfig()
config.Format = logging.FormatDevelopment
logger, _ := logging.NewLogger(config)
```

---

## Conclusion

This error handling system provides a robust foundation for managing errors in HAGUMI-APP. By following the patterns and best practices outlined in this guide, you can ensure that errors are handled gracefully, logged appropriately, and communicated effectively to users.

For questions or issues, please refer to the code documentation or contact the development team.