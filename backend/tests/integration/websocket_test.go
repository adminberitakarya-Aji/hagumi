package integration

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
 
	"github.com/gorilla/websocket"
	"github.com/hagumi/game-loop/auth"
	"github.com/hagumi/game-loop/tests"
)

// TestWebSocket_Connection tests WebSocket connection
func TestWebSocket_Connection(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Mock authentication
		ctx := r.Context()
		ctx = context.WithValue(ctx, "user_id", "test-user-123")
		*r = *r.WithContext(ctx)

		// Upgrade to WebSocket
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade: %v", err)
		}
		defer conn.Close()

		// Send test message
		msg := map[string]interface{}{
			"type": "test",
			"payload": map[string]interface{}{
				"message": "Hello",
			},
		}
		conn.WriteJSON(msg)
	}))
	defer server.Close()

	// Convert http:// to ws://
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Connect to WebSocket
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	// Read message
	_, message, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read message: %v", err)
	}

	tests.AssertNotNil(t, message, "Should receive message")
}

// TestWebSocket_Authentication tests WebSocket authentication
func TestWebSocket_Authentication(t *testing.T) {
	jwtManager := auth.NewJWTManager("test-secret", 24*time.Hour)
	token, err := jwtManager.Generate("test-user-123", "test@example.com")
	tests.AssertNil(t, err, "Token generation should succeed")

	// Create test server with auth
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify token
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		_, err := jwtManager.Verify(tokenString)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Upgrade to WebSocket
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade: %v", err)
		}
		defer conn.Close()
	}))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Connect with valid token
	header := http.Header{}
	header.Add("Authorization", "Bearer "+token)
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, header)
	if err != nil {
		t.Fatalf("Failed to connect with valid token: %v", err)
	}
	defer conn.Close()

	tests.AssertNotNil(t, conn, "Connection should succeed with valid token")
}

// TestWebSocket_MessageHandling tests WebSocket message handling
func TestWebSocket_MessageHandling(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade: %v", err)
		}
		defer conn.Close()

		// Read message
		_, message, err := conn.ReadMessage()
		if err != nil {
			return
		}

		// Parse message
		var msg struct {
			Type    string          `json:"type"`
			Payload json.RawMessage `json:"payload"`
		}
		err = json.Unmarshal(message, &msg)
		if err != nil {
			return
		}

		// Handle different message types
		switch msg.Type {
		case "pet:action":
			var action struct {
				PetID  string `json:"petId"`
				Action string `json:"action"`
			}
			json.Unmarshal(msg.Payload, &action)

			// Send response
			response := map[string]interface{}{
				"type": "action:response",
				"payload": map[string]interface{}{
					"success": true,
					"action":  action.Action,
				},
			}
			conn.WriteJSON(response)
		}
	}))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Connect
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	// Send action message
	actionMsg := map[string]interface{}{
		"type": "pet:action",
		"payload": map[string]interface{}{
			"petId":  "pet-123",
			"action": "feed",
		},
	}
	err = conn.WriteJSON(actionMsg)
	tests.AssertNil(t, err, "Message send should succeed")

	// Read response
	_, response, err := conn.ReadMessage()
	tests.AssertNil(t, err, "Should receive response")
	tests.AssertNotNil(t, response, "Response should not be nil")
}

// TestWebSocket_ConcurrentConnections tests concurrent WebSocket connections
func TestWebSocket_ConcurrentConnections(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		// Keep connection alive
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				return
			}
		}
	}))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Create multiple concurrent connections
	numConnections := 10
	connections := make([]*websocket.Conn, numConnections)
	done := make(chan bool, numConnections)

	for i := 0; i < numConnections; i++ {
		go func(index int) {
			conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
			if err != nil {
				t.Errorf("Connection %d failed: %v", index, err)
				done <- false
				return
			}
			connections[index] = conn
			defer conn.Close()
			done <- true
		}(i)
	}

	// Wait for all connections
	successCount := 0
	for i := 0; i < numConnections; i++ {
		if <-done {
			successCount++
		}
	}

	tests.AssertEqual(t, successCount, numConnections, "All connections should succeed")
}

// TestWebSocket_StateSynchronization tests state synchronization
func TestWebSocket_StateSynchronization(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		// Send periodic state updates in a separate goroutine
		go func() {
			for {
				_, _, err := conn.ReadMessage()
				if err != nil {
					return
				}
			}
		}()

		ticker := time.NewTicker(100 * time.Millisecond)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				stateUpdate := map[string]interface{}{
					"type": "pet:state_update",
					"payload": map[string]interface{}{
						"petId": "pet-123",
						"stats": map[string]interface{}{
							"hunger": 80,
							"mood":   75,
							"energy": 90,
							"health": 100,
						},
					},
				}
				if err := conn.WriteJSON(stateUpdate); err != nil {
					return
				}
			}
		}
	}))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Connect
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	// Read state updates with a deadline
	updateCount := 0
	conn.SetReadDeadline(time.Now().Add(2 * time.Second))

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
		updateCount++
		if updateCount >= 3 { // Get a few updates and then stop
			break
		}
	}

	tests.AssertTrue(t, updateCount > 0, "Should receive at least one state update")
}

// TestWebSocket_ErrorHandling tests WebSocket error handling
func TestWebSocket_ErrorHandling(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		// Read and validate messages
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				return
			}

			var msg struct {
				Type    string          `json:"type"`
				Payload json.RawMessage `json:"payload"`
			}
			err = json.Unmarshal(message, &msg)
			if err != nil {
				// Send error response
				errorMsg := map[string]interface{}{
					"type": "error",
					"payload": map[string]interface{}{
						"code":    "INVALID_MESSAGE",
						"message": "Failed to parse message",
					},
				}
				conn.WriteJSON(errorMsg)
				continue
			}

			// Validate message type
			if msg.Type != "pet:action" && msg.Type != "pet:register" {
				errorMsg := map[string]interface{}{
					"type": "error",
					"payload": map[string]interface{}{
						"code":    "INVALID_MESSAGE_TYPE",
						"message": "Invalid message type",
					},
				}
				conn.WriteJSON(errorMsg)
				continue
			}
		}
	}))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Connect
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	// Send invalid message
	invalidMsg := map[string]interface{}{
		"type": "invalid:type",
		"payload": map[string]interface{}{},
	}
	err = conn.WriteJSON(invalidMsg)
	tests.AssertNil(t, err, "Message send should succeed")

	// Read error response
	_, response, err := conn.ReadMessage()
	tests.AssertNil(t, err, "Should receive error response")
	tests.AssertNotNil(t, response, "Error response should not be nil")
}