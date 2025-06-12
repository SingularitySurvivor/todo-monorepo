import { useEffect, useCallback, useRef } from 'react';
import { sseService, SSEEvent } from '../services/sseService';

// Types for different event handlers
export interface SSEEventHandlers {
  // Todo events
  onTodoCreated?: (todo: any) => void;
  onTodoUpdated?: (todo: any) => void;
  onTodoDeleted?: (todoId: string) => void;
  
  // List events
  onListUpdated?: (list: any) => void;
  onListDeleted?: (event: { listId: string; data: any }) => void;
  onListShared?: (event: { listId: string; data: any }) => void;
  onListRemoved?: (event: { listId: string; data: any }) => void;
  
  // Member events
  onMemberAdded?: (member: any) => void;
  onMemberRemoved?: (memberUserId: string) => void;
  onMemberRoleChanged?: (memberData: any) => void;
  
  // Connection events
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export interface UseSSEOptions {
  listId?: string; // Optional filter for specific list events
  currentUserId?: string; // For filtering member events
  handlers?: SSEEventHandlers;
  autoSubscribe?: boolean; // Default true
}

/**
 * Simplified SSE hook that handles all real-time events
 */
export const useSSE = (options: UseSSEOptions = {}) => {
  const {
    listId,
    currentUserId,
    handlers = {},
    autoSubscribe = true
  } = options;
  
  const handlersRef = useRef<SSEEventHandlers>(handlers);
  
  // Update ref when handlers change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    console.log('Received SSE event:', event);
    
    const currentHandlers = handlersRef.current;
    
    // Filter events by listId if specified (only process events for this specific list)
    if (listId && event.listId && event.listId !== listId && event.listId !== 'global') {
      return; // Ignore events for other lists
    }
    
    switch (event.type) {
      // Todo events
      case 'todo:created':
        currentHandlers.onTodoCreated?.(event.data);
        break;
      case 'todo:updated':
        currentHandlers.onTodoUpdated?.(event.data);
        break;
      case 'todo:deleted':
        currentHandlers.onTodoDeleted?.(event.data.todoId || event.data.id);
        break;
      
      // List events
      case 'list:updated':
        currentHandlers.onListUpdated?.(event.data);
        break;
      case 'list:deleted':
        console.log('List deleted event received for listId:', event.listId);
        if (event.listId && event.listId !== 'global') {
          currentHandlers.onListDeleted?.({ listId: event.listId, data: event.data });
          currentHandlers.onListRemoved?.({ listId: event.listId, data: event.data });
        }
        break;
      
      // Member events
      case 'member:added':
        currentHandlers.onMemberAdded?.(event.data);
        // When user is added to a list, pass the event data instead of just triggering refetch
        if (currentHandlers.onListShared && event.listId && event.listId !== 'global') {
          console.log('User added to list, passing event data:', event.listId);
          currentHandlers.onListShared({ listId: event.listId, data: event.data });
        }
        break;
      case 'member:removed':
        const memberUserId = event.data?.memberUserId || event.data?.userId;
        currentHandlers.onMemberRemoved?.(memberUserId);
        
        // When CURRENT user is removed from a list, it should disappear
        if (currentHandlers.onListRemoved && 
            event.listId && 
            event.listId !== 'global' && 
            memberUserId === currentUserId) {
          console.log('Current user removed from list, passing event data:', event.listId);
          currentHandlers.onListRemoved({ listId: event.listId, data: event.data });
        }
        break;
      case 'member:role_changed':
        currentHandlers.onMemberRoleChanged?.(event.data);
        // When a member's role changes, pass the event data instead of triggering refetch
        if (currentHandlers.onListShared && event.listId && event.listId !== 'global') {
          console.log('Member role changed in list, passing event data:', event.listId);
          currentHandlers.onListShared({ listId: event.listId, data: event.data });
        }
        break;
      
      // Connection events
      case 'ping':
        console.log('SSE ping received - connection is alive');
        break;
      
      default:
        console.log('Unhandled SSE event type:', event.type);
    }
  }, [listId, currentUserId]);

  const subscribe = useCallback(async () => {
    try {
      await sseService.subscribe(handleSSEEvent);
    } catch (error) {
      console.error('Failed to subscribe to SSE:', error);
      handlersRef.current.onError?.(error);
    }
  }, [handleSSEEvent]);

  const unsubscribe = useCallback(() => {
    sseService.unsubscribe(handleSSEEvent);
  }, [handleSSEEvent]);

  const getStatus = useCallback(() => {
    return sseService.getConnectionStatus();
  }, []);

  // Auto-subscribe when enabled
  useEffect(() => {
    if (autoSubscribe) {
      subscribe();
    }

    // Cleanup on unmount
    return () => {
      sseService.unsubscribe(handleSSEEvent);
    };
  }, [autoSubscribe, subscribe, handleSSEEvent]);

  return {
    subscribe,
    unsubscribe,
    getStatus,
    isConnected: sseService.isConnected(),
    handlerCount: sseService.getHandlerCount(),
  };
};