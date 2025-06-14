import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useTodos } from '../../hooks/useTodos';
import { TodoList, TodoHeader, EditTodoDialog } from '../../components/todos';
import ConnectionStatus from '../common/ConnectionStatus';
import { TodoQueryParams, TodoFilters, Todo, UpdateTodoRequest } from '@todo-app/client-common';
import { todoAPI } from '../../utils/apiClient';

const GlobalTodosPage: React.FC = () => {
  const [todoParams, setTodoParams] = useState<TodoQueryParams>({
    sortField: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 50, // Show more todos for global view
  });

  const [editTodoOpen, setEditTodoOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const { todos, loading, error, total, refetch, setFilters, getConnectionStatus } = useTodos(todoParams);

  // Get connection status from the hook
  const connectionStatus = getConnectionStatus();

  const handleFiltersChange = (filters: TodoFilters) => {
    const newParams = { ...todoParams, filters, page: 1 }; // Reset to page 1 when filtering
    setTodoParams(newParams);
    setFilters(newParams);
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    const newParams = { 
      ...todoParams, 
      sortField: field as any,
      sortOrder: order,
      page: 1 // Reset to page 1 when sorting
    };
    setTodoParams(newParams);
    setFilters(newParams);
  };

  const handleClearFilters = () => {
    const newParams = {
      sortField: 'createdAt' as any,
      sortOrder: 'desc' as any,
      page: 1,
      limit: 50,
    };
    setTodoParams(newParams);
    setFilters(newParams);
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setEditTodoOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setEditTodoOpen(true);
  };

  const handleDeleteTodo = async (todo: Todo) => {
    if (window.confirm(`Are you sure you want to delete "${todo.name}"?`)) {
      try {
        setUpdateLoading(true);
        await todoAPI.deleteTodo(todo.id);
        refetch();
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('Failed to delete todo. Please try again.');
      } finally {
        setUpdateLoading(false);
      }
    }
  };

  const handleSaveEdit = async (todoId: string, updates: UpdateTodoRequest) => {
    setUpdateLoading(true);
    try {
      await todoAPI.updateTodo(todoId, updates);
      refetch();
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error; // Re-throw to show error in dialog
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4">
              All Todos
            </Typography>
            {connectionStatus && (
              <ConnectionStatus status={connectionStatus} />
            )}
            {total !== undefined && (
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {total}
              </Box>
            )}
          </Box>
          <Typography variant="body1" color="text.secondary">
            View and manage all your todos across all lists
          </Typography>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Todos Section */}
      <Card>
        <CardContent>
          <TodoHeader
            title=""
            filters={todoParams.filters || {}}
            sortField={todoParams.sortField || 'createdAt'}
            sortOrder={todoParams.sortOrder || 'desc'}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
            showCreateButton={false} // Global view doesn't create todos
            showFilters={true}
            canEdit={false} // Global view is read-only for now
          />

          <TodoList
            todos={todos}
            loading={loading}
            error={error}
            onTodoClick={handleTodoClick}
            onToggleComplete={undefined} // Read-only view for now
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onCreateTodo={undefined}
            emptyStateTitle="No todos found"
            emptyStateMessage="You don't have any todos yet. Create some todos in your lists to see them here."
            showCreateButton={false}
            isCompactView={true} // Always use compact view
            showCollaborationIndicators={true}
            showListName={true} // Show which list each todo belongs to
          />
        </CardContent>
      </Card>

      {/* Edit Todo Dialog */}
      <EditTodoDialog
        open={editTodoOpen}
        todo={selectedTodo}
        onClose={() => {
          setEditTodoOpen(false);
          setSelectedTodo(null);
        }}
        onSave={handleSaveEdit}
        loading={updateLoading}
      />
    </Container>
  );
};

export default GlobalTodosPage;