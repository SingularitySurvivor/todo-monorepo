import React, { useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useTodos } from '../../hooks/useTodos';
import { useSSE } from '../../hooks/useSSE';
import { TodoList, TodoHeader } from '../../components/todos';
import ConnectionStatus from '../common/ConnectionStatus';
import { TodoQueryParams, TodoFilters } from '../../types/todo';

const GlobalTodosPage: React.FC = () => {
  const [todoParams, setTodoParams] = useState<TodoQueryParams>({
    sortField: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 50, // Show more todos for global view
  });

  const { todos, loading, error, total, refetch, setFilters } = useTodos(todoParams);

  // Real-time event handling
  const handleTodoCreated = useCallback(() => {
    console.log('Todo created, refreshing global todos...');
    refetch();
  }, [refetch]);

  const handleTodoUpdated = useCallback(() => {
    console.log('Todo updated, refreshing global todos...');
    refetch();
  }, [refetch]);

  const handleTodoDeleted = useCallback(() => {
    console.log('Todo deleted, refreshing global todos...');
    refetch();
  }, [refetch]);

  // Use the consolidated SSE hook
  const { getStatus } = useSSE({
    handlers: {
      onTodoCreated: handleTodoCreated,
      onTodoUpdated: handleTodoUpdated,
      onTodoDeleted: handleTodoDeleted,
    },
    autoSubscribe: true
  });
  const connectionStatus = getStatus();

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

  const handleTodoClick = (todo: any) => {
    // For global todos, we could navigate to the specific list
    // or open an edit dialog - implementing simple console log for now
    console.log('Todo clicked:', todo);
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
            onEditTodo={undefined}
            onDeleteTodo={undefined}
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
    </Container>
  );
};

export default GlobalTodosPage;