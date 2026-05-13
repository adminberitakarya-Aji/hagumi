package ws

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/hagumi/game-loop/config"
)

// Client represents a connected WebSocket user
type Client struct {
	UserID    string
	Conn      *websocket.Conn
	Send      chan []byte
	Manager   *ConnectionManager
	LastSeen  time.Time
	IsActive  bool
	mu        sync.Mutex
}

// ConnectionManager handles WebSocket clients and message broadcasting
type ConnectionManager struct {
	mu           sync.RWMutex
	clients      map[string]*Client
	
	// Message queue for disconnected clients (userID -> messages)
	offlineQueue map[string][][]byte
	
	// Max queue size per user
	maxQueueSize int
}

// NewConnectionManager creates a new connection manager
func NewConnectionManager() *ConnectionManager {
	manager := &ConnectionManager{
		clients:      make(map[string]*Client),
		offlineQueue: make(map[string][][]byte),
		maxQueueSize: 50, // Increase queue size for better recovery
	}
	
	// Start health monitoring
	go manager.monitorHealth()
	
	return manager
}

// Register adds a new client to the manager
func (m *ConnectionManager) Register(userID string, conn *websocket.Conn) *Client {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	// If client already exists, close old connection
	if oldClient, ok := m.clients[userID]; ok {
		oldClient.Close()
	}
	
	client := &Client{
		UserID:   userID,
		Conn:     conn,
		Send:     make(chan []byte, 256),
		Manager:  m,
		LastSeen: time.Now(),
		IsActive: true,
	}
	
	m.clients[userID] = client
	
	// Process queued messages if any
	if queued, ok := m.offlineQueue[userID]; ok {
		log.Printf("[WS] Replaying %d queued messages for user %s", len(queued), userID)
		for _, msg := range queued {
			select {
			case client.Send <- msg:
			default:
				// If buffer full, stop replaying
				break
			}
		}
		delete(m.offlineQueue, userID)
	}
	
	return client
}

// Unregister removes a client from the manager
func (m *ConnectionManager) Unregister(userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if client, ok := m.clients[userID]; ok {
		client.Close()
		delete(m.clients, userID)
		log.Printf("[WS] Client unregistered: %s", userID)
	}
}

// Close closes the client connection safely
func (c *Client) Close() {
	c.mu.Lock()
	defer c.mu.Unlock()
	
	if !c.IsActive {
		return
	}
	
	c.IsActive = false
	close(c.Send)
	c.Conn.Close()
}

// BroadcastToUser sends a message to a specific user
func (m *ConnectionManager) BroadcastToUser(userID string, message []byte) {
	m.mu.RLock()
	client, ok := m.clients[userID]
	m.mu.RUnlock()
	
	if ok && client.IsActive {
		select {
		case client.Send <- message:
		default:
			log.Printf("[WS] Send buffer full for user %s, queuing message", userID)
			m.queueMessage(userID, message)
			m.Unregister(userID)
		}
	} else {
		m.queueMessage(userID, message)
	}
}

// queueMessage adds a message to the offline queue
func (m *ConnectionManager) queueMessage(userID string, message []byte) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.offlineQueue[userID] = append(m.offlineQueue[userID], message)
	if len(m.offlineQueue[userID]) > m.maxQueueSize {
		// Keep the most recent messages
		m.offlineQueue[userID] = m.offlineQueue[userID][1:]
	}
}

// monitorHealth periodically checks connection health
func (m *ConnectionManager) monitorHealth() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	for range ticker.C {
		m.mu.Lock()
		for userID, client := range m.clients {
			if time.Since(client.LastSeen) > 2*time.Minute {
				log.Printf("[WS] Connection timed out for user %s, cleaning up", userID)
				client.Close()
				delete(m.clients, userID)
			}
		}
		m.mu.Unlock()
	}
}

// WritePump pumps messages from the hub to the websocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(config.PingInterval)
	defer func() {
		ticker.Stop()
		c.Manager.Unregister(c.UserID)
	}()
	
	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(config.WriteWait))
			if !ok {
				// The manager closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			
			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			
			// Add queued messages to the same frame
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.Send)
			}
			
			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(config.WriteWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ReadPump handles messages from the connection to the hub
func (c *Client) ReadPump(handler func(message []byte)) {
	defer func() {
		c.Manager.Unregister(c.UserID)
	}()
	
	c.Conn.SetReadLimit(int64(config.MaxRequestSize))
	c.Conn.SetReadDeadline(time.Now().Add(config.PongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(config.PongWait))
		c.mu.Lock()
		c.LastSeen = time.Now()
		c.mu.Unlock()
		return nil
	})
	
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WS] Read error for user %s: %v", c.UserID, err)
			}
			break
		}
		
		c.mu.Lock()
		c.LastSeen = time.Now()
		c.mu.Unlock()
		
		handler(message)
	}
}

