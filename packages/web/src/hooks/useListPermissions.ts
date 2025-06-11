import { useState, useCallback } from 'react';
import { todoListAPI } from '../utils/apiClient';
import { AddMemberRequest, UpdateMemberRoleRequest, ApiError } from '@todo-app/client-common';

interface UseListPermissionsState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface UseListPermissionsReturn extends UseListPermissionsState {
  addMember: (listId: string, data: AddMemberRequest) => Promise<void>;
  updateMemberRole: (listId: string, data: UpdateMemberRoleRequest) => Promise<void>;
  removeMember: (listId: string, userId: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useListPermissions = (): UseListPermissionsReturn => {
  const [state, setState] = useState<UseListPermissionsState>({
    loading: false,
    error: null,
    success: null,
  });

  const addMember = useCallback(async (listId: string, data: AddMemberRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, success: null }));
      await todoListAPI.addMember(listId, data);
      setState(prev => ({ ...prev, loading: false, success: 'Member added successfully!' }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to add member',
        loading: false,
        success: null,
      }));
      throw err;
    }
  }, []);

  const updateMemberRole = useCallback(async (listId: string, data: UpdateMemberRoleRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, success: null }));
      await todoListAPI.updateMemberRole(listId, data);
      setState(prev => ({ ...prev, loading: false, success: 'Member role updated successfully!' }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to update member role',
        loading: false,
        success: null,
      }));
      throw err;
    }
  }, []);

  const removeMember = useCallback(async (listId: string, userId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, success: null }));
      await todoListAPI.removeMember(listId, userId);
      setState(prev => ({ ...prev, loading: false, success: 'Member removed successfully!' }));
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Failed to remove member',
        loading: false,
        success: null,
      }));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState(prev => ({ ...prev, success: null }));
  }, []);

  return {
    ...state,
    addMember,
    updateMemberRole,
    removeMember,
    clearError,
    clearSuccess,
  };
};