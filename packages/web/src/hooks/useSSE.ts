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
 * Simplified SSE hook that works with persistent connections
 */
export const useSSE = (options: UseSSEOptions = {}) => {
  const {
    listId,
    currentUserId,
    handlers = {},
    autoSubscribe = true
  } = options;
  
  const handlersRef = useRef<SSEEventHandlers>(handlers);
  const listIdRef = useRef(listId);
  const currentUserIdRef = useRef(currentUserId);
  
  // Update refs when values change (but don't recreate callbacks)
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);
  
  useEffect(() => {
    listIdRef.current = listId;
  }, [listId]);
  
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Create stable event handler that doesn't change
  const stableEventHandler = useCallback((event: SSEEvent) => {
    console.log('Received SSE event:', event);
    
    const currentHandlers = handlersRef.current;
    const currentListId = listIdRef.current;
    const currentCurrentUserId = currentUserIdRef.current;
    
    // Filter events by listId if specified (only process events for this specific list)
    if (currentListId && event.listId && event.listId !== currentListId && event.listId !== 'global') {
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
            memberUserId === currentCurrentUserId) {
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
  }, []); // Empty dependency array - this callback never changes

  const subscribe = useCallback(async () => {
    try {
      await sseService.subscribe(stableEventHandler);
    } catch (error) {
      console.error('Failed to subscribe to SSE:', error);
      handlersRef.current.onError?.(error);
    }
  }, [stableEventHandler]);

  const unsubscribe = useCallback(() => {
    sseService.unsubscribe(stableEventHandler);
  }, [stableEventHandler]);

  const getStatus = useCallback(() => {
    return sseService.getConnectionStatus();
  }, []);

  const getDebugInfo = useCallback(() => {
    return sseService.getDebugInfo();
  }, []);

  // Subscribe when component mounts (if autoSubscribe is enabled)
  // Connection stays persistent, so this just adds our handler
  useEffect(() => {
    if (autoSubscribe) {
      subscribe();
    }

    // Cleanup: remove our handler when component unmounts
    // (but connection stays alive for other components)
    return () => {
      sseService.unsubscribe(stableEventHandler);
    };
  }, [autoSubscribe, subscribe, stableEventHandler]);

  return {
    subscribe,
    unsubscribe,
    getStatus,
    getDebugInfo,
    isConnected: sseService.isConnected(),
    handlerCount: sseService.getHandlerCount(),
  };
};