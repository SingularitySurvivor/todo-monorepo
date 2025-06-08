// @ts-ignore
const EventSource = require('eventsource');

export class SSETestHelper {
  static createListEventSource(listId: string, token: string): any {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/sse/lists/${listId}`;
    const eventSource = new EventSource(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return eventSource;
  }

  static createUserEventSource(token: string): any {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/sse/user`;
    const eventSource = new EventSource(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return eventSource;
  }

  static async waitForSSEEvent(eventSource: any, eventType: string, timeout = 10000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for SSE event: ${eventType}`));
      }, timeout);

      const handler = (event: MessageEvent) => {
        console.log(`📡 Received SSE event:`, event.data);
        try {
          const data = JSON.parse(event.data);
          console.log(`📋 Parsed SSE data:`, data);
          if (data.type === eventType) {
            console.log(`✅ Found expected event type: ${eventType}`);
            clearTimeout(timer);
            eventSource.removeEventListener('message', handler);
            eventSource.removeEventListener('error', errorHandler);
            resolve(data);
          }
        } catch (error) {
          console.log(`❌ Error parsing SSE data:`, error);
        }
      };

      const errorHandler = (error: Event) => {
        console.log(`❌ SSE connection error:`, error);
        clearTimeout(timer);
        eventSource.removeEventListener('message', handler);
        eventSource.removeEventListener('error', errorHandler);
        reject(new Error(`SSE connection error while waiting for ${eventType}`));
      };

      eventSource.addEventListener('message', handler);
      eventSource.addEventListener('error', errorHandler);

      console.log(`🔍 Waiting for SSE event: ${eventType}`);
    });
  }

  static async waitForConnection(eventSource: any, timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout waiting for SSE connection'));
      }, timeout);

      const openHandler = () => {
        console.log('✅ SSE connection established');
        clearTimeout(timer);
        eventSource.removeEventListener('open', openHandler);
        eventSource.removeEventListener('error', errorHandler);
        resolve();
      };

      const errorHandler = (error: Event) => {
        console.log('❌ SSE connection failed:', error);
        clearTimeout(timer);
        eventSource.removeEventListener('open', openHandler);
        eventSource.removeEventListener('error', errorHandler);
        reject(new Error('SSE connection failed'));
      };

      if (eventSource.readyState === 1) { // EventSource.OPEN = 1
        clearTimeout(timer);
        resolve();
      } else {
        eventSource.addEventListener('open', openHandler);
        eventSource.addEventListener('error', errorHandler);
      }
    });
  }

  static closeEventSource(eventSource: any): void {
    eventSource.close();
  }
}