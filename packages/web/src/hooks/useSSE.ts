import { useEffect, useCallback, useRef } from 'react';
import { sseService, SSEEvent, SSEEventHandler } from '../services/sseService';

/**
 * Hook for managing SSE subscriptions to a specific todo list
 */
export const useSSE = (listId?: string, onEvent?: SSEEventHandler) => {
  const eventHandlerRef = useRef<SSEEventHandler | undefined>(onEvent);
  
  // Update ref when handler changes
  useEffect(() => {
    eventHandlerRef.current = onEvent;
  }, [onEvent]);

  const subscribe = useCallback(async () => {
    if (!listId || !eventHandlerRef.current) return;
    
    try {
      await sseService.subscribeToList(listId, eventHandlerRef.current);
    } catch (error) {
      console.error('Failed to subscribe to SSE:', error);
    }
  }, [listId]);

  const unsubscribe = useCallback(() => {
    if (!listId || !eventHandlerRef.current) return;
    
    sseService.unsubscribeFromList(listId, eventHandlerRef.current);
  }, [listId]);

  const getStatus = useCallback(() => {
    if (!listId) return 'disconnected';
    return sseService.getConnectionStatus(listId);
  }, [listId]);

  // Auto-subscribe when listId and handler are available
  useEffect(() => {
    if (listId && eventHandlerRef.current) {
      subscribe();
    }

    // Cleanup on unmount or when listId changes
    return () => {
      if (listId && eventHandlerRef.current) {
        sseService.unsubscribeFromList(listId, eventHandlerRef.current);
      }
    };
  }, [listId, subscribe]);

  return {
    subscribe,
    unsubscribe,
    getStatus,
  };
};

/**
 * Hook for handling real-time todo updates (now uses user-global SSE with listId filtering)
 */
export const useRealTimeTodos = (
  listId?: string,
  onTodoCreated?: (todo: any) => void,
  onTodoUpdated?: (todo: any) => void,
  onTodoDeleted?: (todoId: string) => void
) => {
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    console.log('Received SSE event:', event);
    
    // Filter events by listId (only process events for this specific list)
    if (listId && event.listId !== listId && event.listId !== 'global') {
      return; // Ignore events for other lists
    }
    
    switch (event.type) {
      case 'todo:created':
        if (onTodoCreated) {
          onTodoCreated(event.data);
        }
        break;
      case 'todo:updated':
        if (onTodoUpdated) {
          onTodoUpdated(event.data);
        }
        break;
      case 'todo:deleted':
        if (onTodoDeleted) {
          onTodoDeleted(event.data.todoId || event.data.id);
        }
        break;
      case 'ping':
        // Ping events keep the connection alive, no action needed
        console.log('SSE ping received - connection is alive');
        break;
      default:
        console.log('Unhandled SSE event type:', event.type);
    }
  }, [listId, onTodoCreated, onTodoUpdated, onTodoDeleted]);

  // Use user-global SSE instead of list-specific SSE
  const { subscribe, unsubscribe, getStatus } = useUserGlobalSSE(handleSSEEvent);

  return {
    subscribe,
    unsubscribe,
    getStatus,
  };
};

/**
 * Hook for handling real-time list and member updates (now uses user-global SSE with listId filtering)
 */
export const useRealTimeList = (
  listId?: string,
  onListUpdated?: (list: any) => void,
  onMemberAdded?: (member: any) => void,
  onMemberRemoved?: (memberUserId: string) => void,
  onMemberRoleChanged?: (memberData: any) => void
) => {
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    console.log('Received list SSE event:', event);
    
    // Filter events by listId (only process events for this specific list)
    if (listId && event.listId !== listId && event.listId !== 'global') {
      return; // Ignore events for other lists
    }
    
    switch (event.type) {
      case 'list:updated':
        if (onListUpdated) {
          onListUpdated(event.data);
        }
        break;
      case 'list:deleted':
        console.log('List deleted event received for listId:', event.listId);
        // For list deletion, we might want to redirect or show a notification
        // but this is handled at the page level in the global SSE hook
        break;
      case 'member:added':
        if (onMemberAdded) {
          onMemberAdded(event.data);
        }
        break;
      case 'member:removed':
        if (onMemberRemoved) {
          onMemberRemoved(event.data.memberUserId || event.data.userId);
        }
        break;
      case 'member:role_changed':
        if (onMemberRoleChanged) {
          onMemberRoleChanged(event.data);
        }
        break;
      case 'ping':
        // Ping events keep the connection alive, no action needed
        console.log('SSE ping received - connection is alive');
        break;
      default:
        console.log('Unhandled list SSE event type:', event.type);
    }
  }, [listId, onListUpdated, onMemberAdded, onMemberRemoved, onMemberRoleChanged]);

  // Use user-global SSE instead of list-specific SSE
  const { subscribe, unsubscribe, getStatus } = useUserGlobalSSE(handleSSEEvent);

  return {
    subscribe,
    unsubscribe,
    getStatus,
  };
};

/**
 * Hook for managing user-global SSE subscriptions
 */
export const useUserGlobalSSE = (onEvent?: SSEEventHandler) => {
  const eventHandlerRef = useRef<SSEEventHandler | undefined>(onEvent);
  
  // Update ref when handler changes
  useEffect(() => {
    eventHandlerRef.current = onEvent;
  }, [onEvent]);

  const subscribe = useCallback(async () => {
    if (!eventHandlerRef.current) return;
    
    try {
      await sseService.subscribeToUserEvents(eventHandlerRef.current);
    } catch (error) {
      console.error('Failed to subscribe to user-global SSE:', error);
    }
  }, []);

  const unsubscribe = useCallback(() => {
    if (!eventHandlerRef.current) return;
    
    sseService.unsubscribeFromUserEvents(eventHandlerRef.current);
  }, []);

  const getStatus = useCallback(() => {
    return sseService.getUserGlobalConnectionStatus();
  }, []);

  // Auto-subscribe when handler is available
  useEffect(() => {
    if (eventHandlerRef.current) {
      subscribe();
    }

    // Cleanup on unmount
    return () => {
      if (eventHandlerRef.current) {
        sseService.unsubscribeFromUserEvents(eventHandlerRef.current);
      }
    };
  }, [subscribe]);

  return {
    subscribe,
    unsubscribe,
    getStatus,
  };
};

/**
 * Hook for handling user-global real-time list events (for the lists page)
 */
export const useRealTimeListsGlobal = (
  onListShared?: (listId: string) => void, // Changed to pass listId instead of full list
  onListRemoved?: (listId: string) => void,
  onListUpdated?: (list: any) => void,
  currentUserId?: string // Add current user ID to check against
) => {
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    console.log('Received global list SSE event:', event);
    
    // Filter to only handle list-related events that affect the user globally
    switch (event.type) {
      case 'member:added':
        // When user is added to a list, trigger a fetch of that list
        if (onListShared && event.listId && event.listId !== 'global') {
          console.log('User added to list, triggering refetch:', event.listId);
          onListShared(event.listId);
        }
        break;
      case 'member:removed':
        // When CURRENT user is removed from a list, it should disappear
        if (onListRemoved && event.listId && event.listId !== 'global' && event.data?.memberUserId === currentUserId) {
          console.log('Current user removed from list, removing from UI:', event.listId);
          onListRemoved(event.listId);
        } else if (event.data?.memberUserId !== currentUserId) {
          console.log('Another user removed from list, keeping in UI:', event.listId);
        }
        break;
      case 'member:role_changed':
        // When a member's role changes, trigger a list update to refresh permissions
        if (onListUpdated && event.listId && event.listId !== 'global') {
          console.log('Member role changed in list, triggering refetch:', event.listId);
          onListShared?.(event.listId); // Trigger refetch to get updated list data
        }
        break;
      case 'list:updated':
        // When list details change (name, description, etc.)
        if (onListUpdated && event.data) {
          onListUpdated(event.data);
        }
        break;
      case 'list:deleted':
        // When a list is deleted, remove it from the UI
        if (onListRemoved && event.listId && event.listId !== 'global') {
          console.log('List deleted, removing from UI:', event.listId);
          onListRemoved(event.listId);
        }
        break;
      case 'ping':
        // Ping events keep the connection alive, no action needed
        console.log('User-global SSE ping received - connection is alive');
        break;
      default:
        // We might receive todo events on the global connection too
        console.log('Unhandled global SSE event type:', event.type);
    }
  }, [onListShared, onListRemoved, onListUpdated, currentUserId]);

  const { subscribe, unsubscribe, getStatus } = useUserGlobalSSE(handleSSEEvent);

  return {
    subscribe,
    unsubscribe,
    getStatus,
  };
};