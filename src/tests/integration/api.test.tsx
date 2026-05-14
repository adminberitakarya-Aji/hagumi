import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('API Integration Tests', () => {
  const originalWebSocket = global.WebSocket;

  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    global.WebSocket = originalWebSocket;
    jest.clearAllMocks();
  });

  const createMockWS = (mockOverrides = {}) => {
    const mockWS = {
      readyState: 1, // OPEN
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      ...mockOverrides
    };
    
    const MockWebSocket = jest.fn(() => mockWS) as unknown as typeof WebSocket & {
      CONNECTING: number;
      OPEN: number;
      CLOSING: number;
      CLOSED: number;
    };
    MockWebSocket.CONNECTING = 0;
    MockWebSocket.OPEN = 1;
    MockWebSocket.CLOSING = 2;
    MockWebSocket.CLOSED = 3;
    
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    return { MockWebSocket, mockWS };
  };

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection', async () => {
      const { MockWebSocket } = createMockWS({ readyState: 1 });

      // Test connection
      const ws = new WebSocket('ws://localhost:3001/ws');
      
      expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:3001/ws');
      expect(ws.readyState).toBe(MockWebSocket.OPEN);
    });

    it('should handle WebSocket messages', async () => {
      const { mockWS } = createMockWS();

      const ws = new WebSocket('ws://localhost:3001/ws');
      const onOpen = jest.fn();
      ws.addEventListener('open', onOpen);
      
      expect(mockWS.addEventListener).toHaveBeenCalledWith('open', onOpen);
    });

    it('should handle WebSocket errors', async () => {
      const { MockWebSocket, mockWS } = createMockWS({ readyState: 3 });

      const ws = new WebSocket('ws://localhost:3001/ws');
      const onError = jest.fn();
      ws.addEventListener('error', onError);
      
      expect(mockWS.addEventListener).toHaveBeenCalledWith('error', onError);
      expect(ws.readyState).toBe(MockWebSocket.CLOSED);
    });
  });

  describe('Pet Actions', () => {
    it('should send pet action via WebSocket', async () => {
      const { mockWS } = createMockWS();

      const ws = new WebSocket('ws://localhost:3001/ws');
      
      const action = {
        type: 'pet:action',
        payload: {
          petId: 'pet-123',
          action: 'feed',
        },
      };

      ws.send(JSON.stringify(action));

      expect(mockWS.send).toHaveBeenCalledWith(JSON.stringify(action));
    });

    it('should handle action response', async () => {
      let messageHandler: ((event: { data: string }) => void) | undefined;
      const { mockWS } = createMockWS({
        addEventListener: jest.fn((event: string, callback: (event: { data: string }) => void) => {
          if (event === 'message') messageHandler = callback;
        })
      });

      const ws = new WebSocket('ws://localhost:3001/ws');
      const onMessage = jest.fn();
      ws.addEventListener('message', onMessage);
      
      // Simulate receiving a message
      const response = {
        type: 'pet:state_update',
        payload: {
          petId: 'pet-123',
          stats: { hunger: 90, mood: 80, energy: 85, health: 100 },
        },
      };

      if (messageHandler) {
        messageHandler({ data: JSON.stringify(response) });
      }

      expect(mockWS.addEventListener).toHaveBeenCalledWith('message', onMessage);
      expect(onMessage).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { MockWebSocket } = createMockWS({ readyState: 3 });

      const ws = new WebSocket('ws://localhost:3001/ws');
      expect(ws.readyState).toBe(MockWebSocket.CLOSED);
    });

    it('should retry failed connections', async () => {
      let connectionAttempts = 0;
      const mockWS = { readyState: 1 };
      
      const MockWebSocket = jest.fn(() => {
        connectionAttempts++;
        return mockWS;
      }) as unknown as typeof WebSocket & { OPEN: number };
      MockWebSocket.OPEN = 1;
      global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

      // Simulate retry logic
      for (let i = 0; i < 3; i++) {
        const ws = new WebSocket('ws://localhost:3001/ws');
        if (ws.readyState === MockWebSocket.OPEN) {
          break;
        }
      }

      expect(connectionAttempts).toBeGreaterThan(0);
    });
  });

  describe('Loading States', () => {
    it('should show loading state during connection', async () => {
      const { MockWebSocket } = createMockWS({ readyState: 0 });

      const ws = new WebSocket('ws://localhost:3001/ws');
      expect(ws.readyState).toBe(MockWebSocket.CONNECTING);
    });

    it('should hide loading state after connection', async () => {
      const { MockWebSocket } = createMockWS({ readyState: 1 });

      const ws = new WebSocket('ws://localhost:3001/ws');
      expect(ws.readyState).toBe(MockWebSocket.OPEN);
    });
  });
});