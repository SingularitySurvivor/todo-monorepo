import { useState, useEffect, useCallback } from 'react';
import { todoAPI } from '../utils/apiClient';
import { TodoStats } from '../types/todo';
import { ApiError } from '../types/auth';

interface UseTodoStatsReturn {
  stats: TodoStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTodoStats = (): UseTodoStatsReturn => {
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoAPI.getTodoStats();
      setStats(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch todo statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
};

export const useListTodoStats = (listId?: string): UseTodoStatsReturn => {
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!listId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await todoAPI.getListTodoStats(listId);
      setStats(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch list todo statistics');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (listId) {
      fetchStats();
    }
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
};