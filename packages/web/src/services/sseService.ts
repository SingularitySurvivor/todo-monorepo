// Since we no longer have a direct axios client, we'll need to construct the base URL differently
// For now, use the environment variable directly

export interface SSEEvent {
  type: 'todo:created' | 'todo:updated' | 'todo:deleted' | 'list:updated' | 'list:deleted' | 'member:added' | 'member:removed' | 'member:role_changed' | 'ping';
  data: any;
  listId: string;
  timestamp: string;
  userId?: string;
}

export type SSEEventHandler = (event: SSEEvent) => void;

class SSEService {
  private eventSources: Map<string, EventSource> = new Map();
  private eventHandlers: Map<string, Set<SSEEventHandler>> = new Map();

  /**
   * Subscribe to real-time updates for a specific list
   */
  async subscribeToList(listId: string, onEvent: SSEEventHandler): Promise<void> {
    const key = `list:${listId}`;
    
    // If already subscribed, just add the handler
    if (this.eventSources.has(key)) {
      if (!this.eventHandlers.has(key)) {
        this.eventHandlers.set(key, new Set());
      }
      this.eventHandlers.get(key)!.add(onEvent);
      return;
    }

    try {
      // Get auth token for SSE connection
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token available');
      }

      // Create EventSource with auth header (via query param since EventSource doesn't support headers)
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const url = `${baseURL}/sse/lists/${listId}?token=${encodeURIComponent(token)}`;
      const eventSource = new EventSource(url);

      // Initialize handlers set
      if (!this.eventHandlers.has(key)) {
        this.eventHandlers.set(key, new Set());
      }
      this.eventHandlers.get(key)!.add(onEvent);

      // Set up event listeners
      eventSource.onmessage = (event) => {
        try {
          const sseEvent: SSEEvent = JSON.parse(event.data);
          const handlers = this.eventHandlers.get(key);
          if (handlers) {
            handlers.forEach(handler => handler(sseEvent));
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.eventSources.has(key)) {
            this.unsubscribeFromList(listId, onEvent);
            this.subscribeToList(listId, onEvent);
          }
        }, 5000);
      };

      eventSource.onopen = () => {
        console.log(`SSE connection opened for list: ${listId}`);
      };

      this.eventSources.set(key, eventSource);
    } catch (error) {
      console.error('Failed to subscribe to SSE:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user-global real-time updates (all lists for the user)
   */
  async subscribeToUserEvents(onEvent: SSEEventHandler): Promise<void> {
    const key = 'user:global';
    
    // If already subscribed, just add the handler
    if (this.eventSources.has(key)) {
      if (!this.eventHandlers.has(key)) {
        this.eventHandlers.set(key, new Set());
      }
      this.eventHandlers.get(key)!.add(onEvent);
      return;
    }

    try {
      // Get auth token for SSE connection
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token available');
      }

      // Create EventSource for user-global events
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const url = `${baseURL}/sse/user?token=${encodeURIComponent(token)}`;
      const eventSource = new EventSource(url);

      // Initialize handlers set
      if (!this.eventHandlers.has(key)) {
        this.eventHandlers.set(key, new Set());
      }
      this.eventHandlers.get(key)!.add(onEvent);

      // Set up event listeners
      eventSource.onmessage = (event) => {
        try {
          const sseEvent: SSEEvent = JSON.parse(event.data);
          const handlers = this.eventHandlers.get(key);
          if (handlers) {
            handlers.forEach(handler => handler(sseEvent));
          }
        } catch (error) {
          console.error('Error parsing user-global SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('User-global SSE connection error:', error);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.eventSources.has(key)) {
            this.unsubscribeFromUserEvents(onEvent);
            this.subscribeToUserEvents(onEvent);
          }
        }, 5000);
      };

      eventSource.onopen = () => {
        console.log('User-global SSE connection opened');
      };

      this.eventSources.set(key, eventSource);
    } catch (error) {
      console.error('Failed to subscribe to user-global SSE:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from user-global real-time updates
   */
  unsubscribeFromUserEvents(onEvent?: SSEEventHandler): void {
    const key = 'user:global';
    
    if (onEvent) {
      // Remove specific handler
      const handlers = this.eventHandlers.get(key);
      if (handlers) {
        handlers.delete(onEvent);
        
        // If no more handlers, close the connection
        if (handlers.size === 0) {
          this.closeConnection(key);
        }
      }
    } else {
      // Remove all handlers and close connection
      this.closeConnection(key);
    }
  }

  /**
   * Unsubscribe from real-time updates for a specific list
   */
  unsubscribeFromList(listId: string, onEvent?: SSEEventHandler): void {
    const key = `list:${listId}`;
    
    if (onEvent) {
      // Remove specific handler
      const handlers = this.eventHandlers.get(key);
      if (handlers) {
        handlers.delete(onEvent);
        
        // If no more handlers, close the connection
        if (handlers.size === 0) {
          this.closeConnection(key);
        }
      }
    } else {
      // Remove all handlers and close connection
      this.closeConnection(key);
    }
  }

  /**
   * Unsubscribe from all connections
   */
  unsubscribeFromAll(): void {
    this.eventSources.forEach((_, key) => {
      this.closeConnection(key);
    });
  }

  /**
   * Close a specific SSE connection
   */
  private closeConnection(key: string): void {
    const eventSource = this.eventSources.get(key);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(key);
    }
    this.eventHandlers.delete(key);
  }

  /**
   * Get connection status for a specific list
   */
  getConnectionStatus(listId: string): 'connected' | 'connecting' | 'disconnected' {
    const key = `list:${listId}`;
    const eventSource = this.eventSources.get(key);
    
    if (!eventSource) {
      return 'disconnected';
    }

    switch (eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CLOSED:
      default:
        return 'disconnected';
    }
  }

  /**
   * Get user-global connection status
   */
  getUserGlobalConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    const key = 'user:global';
    const eventSource = this.eventSources.get(key);
    
    if (!eventSource) {
      return 'disconnected';
    }

    switch (eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CLOSED:
      default:
        return 'disconnected';
    }
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): string[] {
    return Array.from(this.eventSources.keys());
  }
}

// Export singleton instance
export const sseService = new SSEService();