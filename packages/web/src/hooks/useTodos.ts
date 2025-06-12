import { useState, useEffect, useCallback } from 'react';
import { todoAPI, todoListAPI } from '../utils/apiClient';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoQueryParams, ApiError } from '@todo-app/client-common';
import { useSSE } from './useSSE';

interface UseTodosState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

interface UseTodosReturn extends UseTodosState {
  refetch: () => Promise<void>;
  setFilters: (params: TodoQueryParams) => void;
  getConnectionStatus: () => any;
}

export const useTodos = (initialParams?: TodoQueryParams): UseTodosReturn => {
  const [state, setState] = useState<UseTodosState>({
    todos: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    totalPages: 0,
  });

  const [params, setParams] = useState<TodoQueryParams>(initialParams || {});

  // Helper function to transform todo for global view (same as fetchTodos transform)
  const transformTodoForGlobalView = useCallback(async (todo: any) => {
    // If listId is already an object, extract the name and ID
    if (typeof todo.listId === 'object' && todo.listId?.name) {
      return {
        ...todo,
        listName: todo.listId.name,
        listId: todo.listId._id || todo.listId.id,
      };
    }
    
    // If listId is a string, we need to fetch the list name
    if (typeof todo.listId === 'string') {
      try {
        console.warn('Fetching list name for todo with listId:', todo.listId);
        const response = await todoListAPI.getList(todo.listId);
        return {
          ...todo,
          listName: response.data.list.name,
          listId: todo.listId,
        };
      } catch (error) {
        console.error('Failed to fetch list name for todo:', error);
        // Fallback: return todo without listName
        return {
          ...todo,
          listName: undefined,
          listId: todo.listId,
        };
      }
    }
    
    return todo;
  }, []);

  // Real-time event handlers for global todos
  const handleTodoCreated = useCallback(async (todo: Todo) => {
    console.log('Real-time: Todo created (global)', todo);
    const transformedTodo = await transformTodoForGlobalView(todo);
    setState(prev => ({
      ...prev,
      todos: [transformedTodo, ...prev.todos],
      total: prev.total + 1,
    }));
  }, [transformTodoForGlobalView]);

  const handleTodoUpdated = useCallback(async (updatedTodo: Todo) => {
    console.log('Real-time: Todo updated (global)', updatedTodo);
    const transformedTodo = await transformTodoForGlobalView(updatedTodo);
    setState(prev => ({
      ...prev,
      todos: prev.todos.map(todo => 
        todo.id === updatedTodo.id ? transformedTodo : todo
      ),
    }));
  }, [transformTodoForGlobalView]);

  const handleTodoDeleted = useCallback((todoId: string) => {
    console.log('Real-time: Todo deleted (global)', todoId);
    setState(prev => ({
      ...prev,
      todos: prev.todos.filter(todo => todo.id !== todoId),
      total: Math.max(0, prev.total - 1),
    }));
  }, []);

  // Set up real-time subscription for global todo events (no listId filter)
  const { getStatus } = useSSE({
    handlers: {
      onTodoCreated: handleTodoCreated,
      onTodoUpdated: handleTodoUpdated,
      onTodoDeleted: handleTodoDeleted,
    },
    autoSubscribe: true
  });

  const fetchTodos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await todoAPI.getTodos(params);
      
      // Transform todos to include listName from populated listId
      const transformedTodos = response.data.todos.map((todo: any) => ({
        ...todo,
        listName: todo.listId?.name || undefined,
        listId: typeof todo.listId === 'object' ? todo.listId._id : todo.listId,
      }));
      
      setState(prev => ({
        ...prev,
        todos: transformedTodos,
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 0,
        loading: false,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to fetch todos',
        loading: false,
      }));
    }
  }, [params]);

  const refetch = useCallback(async () => {
    await fetchTodos();
  }, [fetchTodos]);

  const setFilters = useCallback((newParams: TodoQueryParams) => {
    setParams(newParams);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    ...state,
    refetch,
    setFilters,
    getConnectionStatus: getStatus,
  };
};

// Hook for managing todos in a specific list with real-time updates
export const useListTodos = (listId?: string, initialParams?: TodoQueryParams): UseTodosReturn => {
  const [state, setState] = useState<UseTodosState>({
    todos: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    totalPages: 0,
  });

  const [params, setParams] = useState<TodoQueryParams>(initialParams || {});

  const fetchTodos = useCallback(async () => {
    if (!listId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await todoAPI.getListTodos(listId, params);
      
      setState(prev => ({
        ...prev,
        todos: response.data.todos,
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 0,
        loading: false,
      }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to fetch todos',
        loading: false,
      }));
    }
  }, [listId, params]);

  // Real-time event handlers
  const handleTodoCreated = useCallback((todo: Todo) => {
    console.log('Real-time: Todo created', todo);
    setState(prev => ({
      ...prev,
      todos: [todo, ...prev.todos],
      total: prev.total + 1,
    }));
  }, []);

  const handleTodoUpdated = useCallback((updatedTodo: Todo) => {
    console.log('Real-time: Todo updated', updatedTodo);
    setState(prev => ({
      ...prev,
      todos: prev.todos.map(todo => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      ),
    }));
  }, []);

  const handleTodoDeleted = useCallback((todoId: string) => {
    console.log('Real-time: Todo deleted', todoId);
    setState(prev => ({
      ...prev,
      todos: prev.todos.filter(todo => todo.id !== todoId),
      total: Math.max(0, prev.total - 1),
    }));
  }, []);

  // Set up real-time subscription
  const { getStatus } = useSSE({
    listId,
    handlers: {
      onTodoCreated: handleTodoCreated,
      onTodoUpdated: handleTodoUpdated,
      onTodoDeleted: handleTodoDeleted,
    },
    autoSubscribe: true
  });

  const refetch = useCallback(async () => {
    await fetchTodos();
  }, [fetchTodos]);

  const setFilters = useCallback((newParams: TodoQueryParams) => {
    setParams(newParams);
  }, []);

  useEffect(() => {
    if (listId) {
      fetchTodos();
    }
  }, [fetchTodos]);

  return {
    ...state,
    refetch,
    setFilters,
    getConnectionStatus: getStatus,
  };
};

// Hook for creating todos
export const useCreateTodo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTodo = useCallback(async (data: CreateTodoRequest): Promise<Todo> => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoAPI.createTodo(data);
      return response.data.todo;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to create todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTodo,
    loading,
    error,
  };
};

// Hook for managing individual todos
export const useTodo = (todoId?: string) => {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodo = useCallback(async () => {
    if (!todoId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await todoAPI.getTodo(todoId);
      setTodo(response.data.todo);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch todo');
    } finally {
      setLoading(false);
    }
  }, [todoId]);

  const updateTodo = useCallback(async (data: UpdateTodoRequest): Promise<Todo> => {
    if (!todoId) throw new Error('Todo ID is required');
    
    try {
      setError(null);
      const response = await todoAPI.updateTodo(todoId, data);
      setTodo(response.data.todo);
      return response.data.todo;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to update todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [todoId]);

  const deleteTodo = useCallback(async (): Promise<void> => {
    if (!todoId) throw new Error('Todo ID is required');
    
    try {
      setError(null);
      await todoAPI.deleteTodo(todoId);
      setTodo(null);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to delete todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [todoId]);

  useEffect(() => {
    if (todoId) {
      fetchTodo();
    }
  }, [fetchTodo]);

  return {
    todo,
    loading,
    error,
    updateTodo,
    deleteTodo,
    refetch: fetchTodo,
  };
};