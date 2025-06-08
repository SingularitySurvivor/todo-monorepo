import { useState, useEffect, useCallback } from 'react';
import { todoListAPI } from '../utils/apiClient';
import { TodoListWithPermissions, ListQueryParams } from '../types/todoList';
import { ApiError } from '../types/auth';
import { useRealTimeListsGlobal } from './useSSE';
import { useAuth } from '../contexts/AuthContext';

interface UseTodoListsState {
  lists: TodoListWithPermissions[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

interface UseTodoListsReturn extends UseTodoListsState {
  refetch: () => Promise<void>;
  setFilters: (filters: ListQueryParams) => void;
}

export const useTodoLists = (initialParams?: ListQueryParams): UseTodoListsReturn => {
  const [state, setState] = useState<UseTodoListsState>({
    lists: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    totalPages: 0,
  });

  const [params, setParams] = useState<ListQueryParams>(initialParams || {});
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Real-time event handlers
  const handleListShared = useCallback(async (listId: string) => {
    console.log('Real-time: User added to list, fetching list details:', listId);
    try {
      // Fetch the full list details
      const response = await todoListAPI.getList(listId);
      const newList = response.data.list;
      
      setState(prev => ({
        ...prev,
        lists: [newList, ...prev.lists.filter(l => l.id !== listId)], // Add to top, avoid duplicates
        total: prev.lists.some(l => l.id === listId) ? prev.total : prev.total + 1, // Only increment if new
      }));
      
      console.log('Real-time: Successfully added new list to state:', newList.name);
    } catch (error) {
      console.error('Failed to fetch newly shared list:', error);
    }
  }, []);

  const handleListRemoved = useCallback((listId: string) => {
    console.log('Real-time: User removed from list', listId);
    setState(prev => ({
      ...prev,
      lists: prev.lists.filter(list => list.id !== listId),
      total: Math.max(0, prev.total - 1),
    }));
  }, []);

  const handleListUpdated = useCallback((updatedList: TodoListWithPermissions) => {
    console.log('Real-time: List updated', updatedList);
    setState(prev => ({
      ...prev,
      lists: prev.lists.map(list => 
        list.id === updatedList.id ? updatedList : list
      ),
    }));
  }, []);

  // Set up real-time subscription for global list events
  useRealTimeListsGlobal(
    handleListShared,
    handleListRemoved,
    handleListUpdated,
    currentUserId
  );

  const fetchLists = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await todoListAPI.getLists(params);
      
      setState(prev => ({
        ...prev,
        lists: response.data.lists,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
        loading: false,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to fetch todo lists',
        loading: false,
      }));
    }
  }, [params]);

  const refetch = useCallback(async () => {
    await fetchLists();
  }, [fetchLists]);

  const setFilters = useCallback((newParams: ListQueryParams) => {
    setParams(newParams);
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    ...state,
    refetch,
    setFilters,
  };
};