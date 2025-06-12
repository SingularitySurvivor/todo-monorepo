export interface SSEEvent {
  type: 'todo:created' | 'todo:updated' | 'todo:deleted' | 'list:updated' | 'list:deleted' | 'member:added' | 'member:removed' | 'member:role_changed' | 'ping';
  data: any;
  listId: string;
  timestamp: string;
  userId?: string;
}

export type SSEEventHandler = (event: SSEEvent) => void;

class SSEService {
  private eventSource: EventSource | null = null;
  private eventHandlers: Set<SSEEventHandler> = new Set();
  private isConnecting: boolean = false;

  /**
   * Subscribe to real-time updates for the current user
   */
  async subscribe(onEvent: SSEEventHandler): Promise<void> {
    // Add the handler to our set
    this.eventHandlers.add(onEvent);

    // If already connected or connecting, just add the handler and return
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
      return;
    }

    // If already in the process of connecting, wait for it
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      // Get auth token for SSE connection
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token available');
      }

      // Create EventSource for user events
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const url = `${baseURL}/sse/user?token=${encodeURIComponent(token)}`;
      
      this.eventSource = new EventSource(url);

      // Set up event listeners
      this.eventSource.onmessage = (event) => {
        try {
          const sseEvent: SSEEvent = JSON.parse(event.data);
          // Notify all handlers
          this.eventHandlers.forEach(handler => handler(sseEvent));
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.isConnecting = false;
        
        // Attempt to reconnect after a delay if we still have handlers
        if (this.eventHandlers.size > 0) {
          setTimeout(() => {
            if (this.eventHandlers.size > 0) {
              this.reconnect();
            }
          }, 5000);
        }
      };

      this.eventSource.onopen = () => {
        console.log('SSE connection opened');
        this.isConnecting = false;
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to subscribe to SSE:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(onEvent?: SSEEventHandler): void {
    if (onEvent) {
      // Remove specific handler
      this.eventHandlers.delete(onEvent);
    } else {
      // Remove all handlers
      this.eventHandlers.clear();
    }

    // If no more handlers, close the connection
    if (this.eventHandlers.size === 0) {
      this.disconnect();
    }
  }

  /**
   * Disconnect and close the SSE connection
   */
  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
  }

  /**
   * Attempt to reconnect
   */
  private async reconnect(): Promise<void> {
    this.disconnect();
    
    // Get any handler to trigger reconnection
    const firstHandler = this.eventHandlers.values().next().value;
    if (firstHandler) {
      await this.subscribe(firstHandler);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.isConnecting) {
      return 'connecting';
    }

    if (!this.eventSource) {
      return 'disconnected';
    }

    switch (this.eventSource.readyState) {
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
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.getConnectionStatus() === 'connected';
  }

  /**
   * Get number of active handlers
   */
  getHandlerCount(): number {
    return this.eventHandlers.size;
  }

  /**
   * Cleanup all connections (useful for app shutdown)
   */
  cleanup(): void {
    this.eventHandlers.clear();
    this.disconnect();
  }
}

// Export singleton instance
export const sseService = new SSEService();