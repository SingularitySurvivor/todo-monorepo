import { Response } from 'express';
import { TodoList, Todo } from '../models';
import { ApiError } from '../utils';

export interface SSEClient {
  id: string;
  userId: string;
  response: Response;
  lastPing: Date;
}

export interface SSEEvent {
  type: 'todo:created' | 'todo:updated' | 'todo:deleted' | 'list:updated' | 'list:deleted' | 'member:added' | 'member:removed' | 'member:role_changed' | 'ping';
  data?: any;
  listId: string;
  userId?: string;
  timestamp: Date;
}

class SSEService {
  private clients: Map<string, SSEClient> = new Map();
  private pingInterval: NodeJS.Timeout;

  constructor() {
    // Send ping every 30 seconds to keep connections alive
    this.pingInterval = setInterval(() => {
      this.sendPingToAll();
    }, 30000);

    // Clean up dead connections every 5 minutes
    setInterval(() => {
      this.cleanupDeadConnections();
    }, 300000);
  }


  /**
   * Add a new user SSE client
   */
  async addUserClient(clientId: string, userId: string, response: Response): Promise<void> {
    // Set up SSE headers
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Add client to the map
    const client: SSEClient = {
      id: clientId,
      userId,
      response,
      lastPing: new Date(),
    };

    this.clients.set(clientId, client);

    // Send initial connection event
    this.sendToClient(clientId, {
      type: 'ping',
      listId: 'global', // Use 'global' to indicate user-level connection
      timestamp: new Date(),
      data: { message: 'Connected to user real-time updates' }
    });

    // Handle client disconnect
    response.on('close', () => {
      this.removeClient(clientId);
    });

    response.on('error', () => {
      this.removeClient(clientId);
    });

    console.log(`SSE user client connected: ${clientId} for user ${userId}`);
  }

  /**
   * Remove a client
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.response.end();
      } catch (error) {
        // Client already disconnected
      }
      this.clients.delete(clientId);
      console.log(`SSE client disconnected: ${clientId}`);
    }
  }

  /**
   * Broadcast events to user connections for users with access to the list
   */
  async broadcast(listId: string, event: SSEEvent, excludeUserId?: string, memberUserIds?: string[]): Promise<void> {
    try {
      console.log(`SSE: broadcast called - listId=${listId}, eventType=${event.type}, excludeUserId=${excludeUserId}`);
      
      // Validate the listId format first to prevent cast errors
      if (!listId || typeof listId !== 'string') {
        console.error('Invalid listId provided to broadcast:', listId);
        return;
      }

      // If listId looks like an object string (debug output), skip broadcast
      if (listId.includes('{') || listId.includes('ObjectId')) {
        console.error('Malformed listId detected in broadcast:', listId);
        return;
      }

      let targetMemberUserIds: string[];

      // For list:deleted events, use the provided memberUserIds since the list is already deleted
      if (event.type === 'list:deleted' && memberUserIds) {
        targetMemberUserIds = memberUserIds;
        console.log(`SSE: Using provided member list for deleted list ${listId}:`, targetMemberUserIds);
      } else {
        // For other events, get members from the database
        const list = await TodoList.findById(listId).populate('members.userId', '_id');
        if (!list) {
          console.log(`SSE: List ${listId} not found for broadcast`);
          return;
        }

        targetMemberUserIds = list.members.map(member => {
          // Handle both populated and non-populated userId
          if (typeof member.userId === 'object' && member.userId._id) {
            return member.userId._id.toString();
          }
          return member.userId.toString();
        });
        console.log(`SSE: List ${listId} has members for broadcast:`, targetMemberUserIds);
      }

      let sentCount = 0;
      // Send to user connections for users who have access to this list
      for (const [clientId, client] of this.clients.entries()) {
        let shouldSendToClient = false;
        
        if (event.type === 'member:removed') {
          // For member removal, send to:
          // 1. All remaining members (so they see the user was removed)
          // 2. The removed user (so their UI updates) - this is in event.data.memberUserId
          const removedUserId = event.data?.memberUserId;
          shouldSendToClient = targetMemberUserIds.includes(client.userId) || client.userId === removedUserId;
        } else {
          // For other events, send to current members only
          shouldSendToClient = targetMemberUserIds.includes(client.userId);
        }
        
        // Apply excludeUserId filter (typically the user who performed the action)
        if (shouldSendToClient && client.userId !== excludeUserId) {
          console.log(`SSE: Sending ${event.type} to user client ${clientId} (user ${client.userId})`);
          this.sendToClient(clientId, event);
          sentCount++;
        }
      }
      
      console.log(`SSE: Broadcasted ${event.type} to ${sentCount} user clients for list ${listId}`);
    } catch (error) {
      console.error('Error in broadcast:', error);
      // Don't throw the error to prevent server crashes
    }
  }

  /**
   * Send an event to a specific client
   */
  sendToClient(clientId: string, event: SSEEvent): void {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }

    try {
      const data = JSON.stringify({
        type: event.type,
        data: event.data,
        listId: event.listId,
        userId: event.userId,
        timestamp: event.timestamp,
      });

      client.response.write(`data: ${data}\n\n`);
      client.lastPing = new Date();
    } catch (error) {
      console.error(`Error sending SSE event to client ${clientId}:`, error);
      this.removeClient(clientId);
    }
  }

  /**
   * Send ping to all clients to keep connections alive
   */
  private sendPingToAll(): void {
    const now = new Date();
    for (const [clientId, client] of this.clients.entries()) {
      this.sendToClient(clientId, {
        type: 'ping',
        listId: 'global', // All connections are user-level
        timestamp: now,
      });
    }
  }

  /**
   * Clean up connections that haven't responded to pings
   */
  private cleanupDeadConnections(): void {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [clientId, client] of this.clients.entries()) {
      if (now.getTime() - client.lastPing.getTime() > timeout) {
        console.log(`Removing dead SSE connection: ${clientId}`);
        this.removeClient(clientId);
      }
    }
  }

  /**
   * Get the number of active clients
   */
  getActiveClientsCount(): number {
    return this.clients.size;
  }


  /**
   * Cleanup on shutdown
   */
  cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Close all client connections
    for (const [clientId] of this.clients.entries()) {
      this.removeClient(clientId);
    }
  }
}

// Export a singleton instance
export const sseService = new SSEService();

// Helper functions for broadcasting events
export const broadcastTodoCreated = async (listId: string, todo: any, userId: string) => {
  console.log(`SSE: Broadcasting todo:created for listId=${listId}, todoId=${todo.id}, excludeUserId=${userId}`);
  
  // Populate user information for consistent format
  let populatedTodo = todo;
  if (todo.userId && !todo.userId.firstName) {
    populatedTodo = await Todo.findById(todo.id).populate('userId', 'firstName lastName email');
  }
  
  sseService.broadcast(listId, {
    type: 'todo:created',
    data: populatedTodo,
    listId,
    userId,
    timestamp: new Date(),
  }, userId);
};

export const broadcastTodoUpdated = async (listId: string, todo: any, userId: string) => {
  console.log(`SSE: Broadcasting todo:updated for listId=${listId}, todoId=${todo.id}, excludeUserId=${userId}`);
  
  // Populate user information for consistent format
  let populatedTodo = todo;
  if (todo.userId && !todo.userId.firstName) {
    populatedTodo = await Todo.findById(todo.id).populate('userId', 'firstName lastName email');
  }
  
  sseService.broadcast(listId, {
    type: 'todo:updated',
    data: populatedTodo,
    listId,
    userId,
    timestamp: new Date(),
  }, userId);
};

export const broadcastTodoDeleted = (listId: string, todoId: string, userId: string) => {
  console.log(`SSE: Broadcasting todo:deleted for listId=${listId}, todoId=${todoId}, excludeUserId=${userId}`);
  sseService.broadcast(listId, {
    type: 'todo:deleted',
    data: { todoId },
    listId,
    userId,
    timestamp: new Date(),
  }, userId);
};

export const broadcastListUpdated = (listId: string, list: any, userId: string) => {
  sseService.broadcast(listId, {
    type: 'list:updated',
    data: list,
    listId,
    userId,
    timestamp: new Date(),
  }, userId);
};

export const broadcastMemberAdded = (listId: string, member: any, userId: string) => {
  sseService.broadcast(listId, {
    type: 'member:added',
    data: member,
    listId,
    userId,
    timestamp: new Date(),
  }, userId);
};

export const broadcastMemberRemoved = (listId: string, memberUserId: string, userId: string) => {
  sseService.broadcast(listId, {
    type: 'member:removed',
    data: { memberUserId },
    listId,
    userId,
    timestamp: new Date(),
  }, userId);
};

export const broadcastMemberRoleChanged = (listId: string, memberData: any, userId: string) => {
  sseService.broadcast(listId, {
    type: 'member:role_changed',
    data: memberData,
    listId,
    userId,
    timestamp: new Date(),
  }, userId);
};

export const broadcastListDeleted = (listId: string, listData: any, userId: string) => {
  console.log(`SSE: Broadcasting list:deleted for listId=${listId}, excludeUserId=${userId}`);
  
  // Extract memberUserIds from listData if provided
  const memberUserIds = listData.memberUserIds;
  
  sseService.broadcast(listId, {
    type: 'list:deleted',
    data: { listId, ...listData },
    listId,
    userId,
    timestamp: new Date(),
  }, userId, memberUserIds);
};