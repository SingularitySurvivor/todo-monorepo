import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Edit,
  Share,
} from '@mui/icons-material';
import { useTodoList } from '../../hooks';
import { useListTodos } from '../../hooks/useTodos';
import { useSSE } from '../../hooks/useSSE';
import { TodoList, CreateTodoDialog, EditTodoDialog, TodoHeader } from '../../components/todos';
import { MembersDialog } from '../../components/todo-lists';
import ConnectionStatus from '../common/ConnectionStatus';
import { Todo, TodoStatus, UpdateTodoRequest, TodoQueryParams, TodoFilters } from '@todo-app/client-common';
import { todoAPI } from '../../utils/apiClient';

const TodoListDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [todoParams, setTodoParams] = useState<TodoQueryParams>({
    sortField: 'createdAt',
    sortOrder: 'desc'
  });

  const { list, loading: listLoading, error: listError, refetch: refetchList } = useTodoList(listId);
  const { todos, loading: todosLoading, error: todosError, refetch: refetchTodos, setFilters } = useListTodos(listId, todoParams);
  
  const [createTodoOpen, setCreateTodoOpen] = useState(false);
  const [editTodoOpen, setEditTodoOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Use SSE connection with event filtering for this specific list
  const { getStatus } = useSSE({
    listId,
    handlers: {
      onTodoCreated: () => refetchTodos(),
      onTodoUpdated: () => refetchTodos(),
      onTodoDeleted: () => refetchTodos(),
      onListUpdated: () => refetchList(),
      onMemberAdded: () => refetchList(),
      onMemberRemoved: () => refetchList(),
      onMemberRoleChanged: () => refetchList(),
    },
    autoSubscribe: true
  });
  
  // Get connection status
  const connectionStatus = getStatus();

  if (!listId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">List ID is required</Alert>
      </Container>
    );
  }

  if (listLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (listError || !list) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {listError || 'List not found'}
        </Alert>
      </Container>
    );
  }

  const handleCreateTodo = () => {
    setCreateTodoOpen(true);
  };

  const handleCreateTodoSuccess = () => {
    refetchTodos();
  };

  const handleManageMembers = () => {
    setMembersDialogOpen(true);
  };

  const handleMembersSuccess = () => {
    // Refetch list data to get updated member information
    refetchList();
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      setUpdateLoading(true);
      const newStatus = todo.status === TodoStatus.COMPLETED 
        ? TodoStatus.NOT_STARTED 
        : TodoStatus.COMPLETED;
      
      await todoAPI.updateTodo(todo.id, { status: newStatus });
      refetchTodos();
    } catch (error) {
      console.error('Failed to toggle todo status:', error);
    } finally {
      setUpdateLoading(false);
    }
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
        refetchTodos();
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('Failed to delete todo. Please try again.');
      } finally {
        setUpdateLoading(false);
      }
    }
  };

  const handleTodoClick = (todo: Todo) => {
    // Click to edit functionality
    handleEditTodo(todo);
  };

  const handleSaveEdit = async (todoId: string, updates: UpdateTodoRequest) => {
    setUpdateLoading(true);
    try {
      await todoAPI.updateTodo(todoId, updates);
      refetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error; // Re-throw to show error in dialog
    } finally {
      setUpdateLoading(false);
    }
  };


  const handleFiltersChange = (filters: TodoFilters) => {
    const newParams = { ...todoParams, filters };
    setTodoParams(newParams);
    setFilters(newParams);
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    const newParams = { 
      ...todoParams, 
      sortField: field as any,
      sortOrder: order 
    };
    setTodoParams(newParams);
    setFilters(newParams);
  };

  const handleClearFilters = () => {
    const newParams = {
      sortField: 'createdAt' as any,
      sortOrder: 'desc' as any
    };
    setTodoParams(newParams);
    setFilters(newParams);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/lists')}
          sx={{ textDecoration: 'none' }}
        >
          Todo Lists
        </Link>
        <Typography variant="body2" color="text.primary">
          {list.name}
        </Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Box mb={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/lists')}
          variant="text"
        >
          Back to Lists
        </Button>
      </Box>

      {/* List Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {list.icon && (
                  <Box
                    sx={{
                      fontSize: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: list.color ? `${list.color}20` : 'grey.100',
                    }}
                  >
                    {list.icon}
                  </Box>
                )}
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {list.name}
                  </Typography>
                  {list.description && (
                    <Typography variant="body1" color="text.secondary">
                      {list.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
          </Box>

          {/* List Stats */}
          <Box display="flex" gap={4} alignItems="center" justifyContent="space-between">
            <Box display="flex" gap={4} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                <strong>{todos.length}</strong> total todos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{todos.filter(todo => todo.status === TodoStatus.COMPLETED).length}</strong> completed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{list.members.length}</strong> member{list.members.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            
            {/* Real-time Connection Status */}
            <ConnectionStatus status={connectionStatus} listId={listId} />
          </Box>
        </CardContent>
      </Card>

      {/* Todos Section */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Todos
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1}>
              {list.canEdit && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateTodo}
                  size="small"
                >
                  Add Todo
                </Button>
              )}
            </Box>
          </Box>

          <TodoHeader
            title=""
            filters={todoParams.filters || {}}
            sortField={todoParams.sortField || 'createdAt'}
            sortOrder={todoParams.sortOrder || 'desc'}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
            onCreateTodo={list.canEdit ? handleCreateTodo : undefined}
            showCreateButton={false} // We have the button above
            showFilters={true}
            canEdit={list.canEdit}
          />

          <TodoList
            todos={todos}
            loading={todosLoading}
            error={todosError}
            onTodoClick={handleTodoClick}
            onToggleComplete={handleToggleComplete}
            onEditTodo={list.canEdit ? handleEditTodo : undefined}
            onDeleteTodo={list.canEdit ? handleDeleteTodo : undefined}
            onCreateTodo={list.canEdit ? handleCreateTodo : undefined}
            emptyStateTitle="No todos yet"
            emptyStateMessage={
              list.canEdit 
                ? "Add your first todo to get started with this list."
                : "No todos have been added to this list yet."
            }
            showCreateButton={list.canEdit}
            isCompactView={true} // Always use compact view
            showCollaborationIndicators={true} // Enable collaboration features
          />
        </CardContent>
      </Card>

      {/* Create Todo Dialog */}
      {list.canEdit && (
        <CreateTodoDialog
          open={createTodoOpen}
          listId={listId}
          onClose={() => setCreateTodoOpen(false)}
          onSuccess={handleCreateTodoSuccess}
        />
      )}

      {/* Edit Todo Dialog */}
      {list.canEdit && (
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
      )}

      {/* Members Dialog */}
      <MembersDialog
        open={membersDialogOpen}
        list={list}
        onClose={() => setMembersDialogOpen(false)}
        onSuccess={handleMembersSuccess}
      />
    </Container>
  );
};

export default TodoListDetailPage;