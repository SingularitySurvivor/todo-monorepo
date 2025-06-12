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
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;
  private isInitialized: boolean = false;

  constructor() {
    // Set up browser cleanup listeners
    this.setupBrowserCleanup();
  }

  /**
   * Set up cleanup when browser window is closed
   */
  private setupBrowserCleanup(): void {
    // Handle page unload/refresh/close
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Handle browser tab close (as backup)
    window.addEventListener('unload', () => {
      this.cleanup();
    });

    // Handle page visibility changes (optional - for when tab goes into background)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.eventHandlers.size > 0) {
        // Page became visible again, ensure connection is active
        this.ensureConnection();
      }
    });
  }

  /**
   * Subscribe to real-time updates for the current user
   * Now creates persistent connection that stays alive until browser closes
   */
  async subscribe(onEvent: SSEEventHandler): Promise<void> {
    console.log('SSE: subscribe called, current state:', {
      hasEventSource: !!this.eventSource,
      readyState: this.eventSource?.readyState,
      isConnecting: this.isConnecting,
      handlerCount: this.eventHandlers.size,
      isInitialized: this.isInitialized
    });

    // Add the handler to our set
    this.eventHandlers.add(onEvent);

    // Ensure we have a connection (but don't create multiple)
    await this.ensureConnection();
  }

  /**
   * Ensure we have an active SSE connection
   */
  private async ensureConnection(): Promise<void> {
    // If we have a working connection, we're good
    if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
      console.log('SSE: Connection already active');
      return;
    }

    // If we're already connecting, don't start another
    if (this.isConnecting) {
      console.log('SSE: Already connecting, waiting...');
      return;
    }

    // If connection is in CONNECTING state, wait for it
    if (this.eventSource && this.eventSource.readyState === EventSource.CONNECTING) {
      console.log('SSE: Connection in CONNECTING state, waiting...');
      return;
    }

    // Need to establish new connection
    await this.connect();
  }

  /**
   * Establish SSE connection
   */
  private async connect(): Promise<void> {
    this.isConnecting = true;
    
    try {
      // Clean up any existing connection
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      // Get auth token for SSE connection
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token available');
      }

      console.log('SSE: Establishing new persistent connection...');

      // Create EventSource for user events
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const url = `${baseURL}/sse/user?token=${encodeURIComponent(token)}`;
      
      this.eventSource = new EventSource(url);

      // Set up event listeners
      this.eventSource.onmessage = (event) => {
        try {
          const sseEvent: SSEEvent = JSON.parse(event.data);
          // Notify all handlers (even if temporarily zero during navigation)
          this.eventHandlers.forEach(handler => {
            try {
              handler(sseEvent);
            } catch (error) {
              console.error('Error in SSE event handler:', error);
            }
          });
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.isConnecting = false;
        
        // Always attempt to reconnect (connection is persistent)
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
          console.log(`SSE: Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
          
          setTimeout(() => {
            this.connect();
          }, delay);
        } else {
          console.error('SSE: Max reconnection attempts reached, will retry on next subscribe call');
          this.reconnectAttempts = 0; // Reset for future attempts
        }
      };

      this.eventSource.onopen = () => {
        console.log('SSE: Persistent connection opened successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset on successful connection
        this.isInitialized = true;
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to establish SSE connection:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe a specific handler (but keep connection alive)
   */
  unsubscribe(onEvent?: SSEEventHandler): void {
    if (onEvent) {
      this.eventHandlers.delete(onEvent);
      console.log('SSE: Removed handler, remaining:', this.eventHandlers.size);
    } else {
      this.eventHandlers.clear();
      console.log('SSE: Cleared all handlers');
    }

    // Note: We NO LONGER close the connection when handlers reach zero
    // The connection stays alive for the entire browser session
    console.log('SSE: Connection remains active for future use');
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
   * Manual reconnect (useful for debugging or auth token refresh)
   */
  async reconnect(): Promise<void> {
    console.log('SSE: Manual reconnect requested');
    this.disconnect();
    await this.connect();
  }

  /**
   * Disconnect and close the SSE connection
   */
  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE: Connection closed');
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Full cleanup - only called when browser window is closing
   */
  cleanup(): void {
    console.log('SSE: Full cleanup called (browser closing)');
    this.eventHandlers.clear();
    this.disconnect();
    this.isInitialized = false;
  }

  /**
   * Get connection info for debugging
   */
  getDebugInfo(): object {
    return {
      isConnected: this.isConnected(),
      status: this.getConnectionStatus(),
      handlerCount: this.getHandlerCount(),
      isInitialized: this.isInitialized,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      hasEventSource: !!this.eventSource,
      readyState: this.eventSource?.readyState
    };
  }
}

// Export singleton instance
export const sseService = new SSEService();