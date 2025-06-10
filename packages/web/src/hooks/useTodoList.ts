import { useState, useEffect, useCallback } from 'react';
import { todoListAPI } from '../utils/apiClient';
import { TodoListWithPermissions, CreateTodoListRequest, UpdateTodoListRequest } from '../types/todoList';
import { ApiError } from '../types/auth';
import { useSSE } from './useSSE';

interface UseTodoListState {
  list: TodoListWithPermissions | null;
  loading: boolean;
  error: string | null;
}

interface UseTodoListReturn extends UseTodoListState {
  refetch: () => Promise<void>;
  updateList: (data: UpdateTodoListRequest) => Promise<void>;
  deleteList: () => Promise<void>;
  archiveList: (isArchived: boolean) => Promise<void>;
}

export const useTodoList = (listId?: string): UseTodoListReturn => {
  const [state, setState] = useState<UseTodoListState>({
    list: null,
    loading: false,
    error: null,
  });

  const fetchList = useCallback(async () => {
    if (!listId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await todoListAPI.getList(listId);
      
      setState(prev => ({
        ...prev,
        list: response.data.list,
        loading: false,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to fetch todo list',
        loading: false,
      }));
    }
  }, [listId]);

  // Real-time event handlers
  const handleListUpdated = useCallback((updatedList: TodoListWithPermissions) => {
    console.log('Real-time: List updated', updatedList);
    setState(prev => ({
      ...prev,
      list: updatedList,
    }));
  }, []);

  const handleMemberAdded = useCallback((member: any) => {
    console.log('Real-time: Member added', member);
    setState(prev => ({
      ...prev,
      list: prev.list ? {
        ...prev.list,
        members: [...prev.list.members, member],
      } : prev.list,
    }));
  }, []);

  const handleMemberRemoved = useCallback((memberUserId: string) => {
    console.log('Real-time: Member removed', memberUserId);
    setState(prev => ({
      ...prev,
      list: prev.list ? {
        ...prev.list,
        members: prev.list.members.filter(member => member.userId !== memberUserId),
      } : prev.list,
    }));
  }, []);

  const handleMemberRoleChanged = useCallback((memberData: any) => {
    console.log('Real-time: Member role changed', memberData);
    setState(prev => ({
      ...prev,
      list: prev.list ? {
        ...prev.list,
        members: prev.list.members.map(member => 
          member.userId === memberData.userId 
            ? { ...member, role: memberData.role }
            : member
        ),
      } : prev.list,
    }));
  }, []);

  // Set up real-time subscription
  useSSE({
    listId,
    handlers: {
      onListUpdated: handleListUpdated,
      onMemberAdded: handleMemberAdded,
      onMemberRemoved: handleMemberRemoved,
      onMemberRoleChanged: handleMemberRoleChanged,
    },
    autoSubscribe: true
  });

  const updateList = useCallback(async (data: UpdateTodoListRequest) => {
    if (!listId) throw new Error('List ID is required');
    
    try {
      setState(prev => ({ ...prev, error: null }));
      const response = await todoListAPI.updateList(listId, data);
      
      setState(prev => ({
        ...prev,
        list: response.data.list,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to update todo list',
      }));
      throw err;
    }
  }, [listId]);

  const deleteList = useCallback(async () => {
    if (!listId) throw new Error('List ID is required');
    
    try {
      setState(prev => ({ ...prev, error: null }));
      await todoListAPI.deleteList(listId);
      
      setState(prev => ({
        ...prev,
        list: null,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to delete todo list',
      }));
      throw err;
    }
  }, [listId]);

  const archiveList = useCallback(async (isArchived: boolean) => {
    if (!listId) throw new Error('List ID is required');
    
    try {
      setState(prev => ({ ...prev, error: null }));
      const response = await todoListAPI.archiveList(listId, isArchived);
      
      setState(prev => ({
        ...prev,
        list: response.data.list,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to archive todo list',
      }));
      throw err;
    }
  }, [listId]);

  const refetch = useCallback(async () => {
    await fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (listId) {
      fetchList();
    }
  }, [fetchList]);

  return {
    ...state,
    refetch,
    updateList,
    deleteList,
    archiveList,
  };
};

// Hook for creating new todo lists
export const useCreateTodoList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createList = useCallback(async (data: CreateTodoListRequest): Promise<TodoListWithPermissions> => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoListAPI.createList(data);
      return response.data.list;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to create todo list';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createList,
    loading,
    error,
  };
};