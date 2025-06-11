import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Todo, TodoStatus } from '@todo-app/client-common';
import TodoCard from './TodoCard';
import TodoRow from './TodoRow';

interface TodoListProps {
  todos: Todo[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onTodoClick?: (todo: Todo) => void;
  onToggleComplete?: (todo: Todo) => void;
  onEditTodo?: (todo: Todo) => void;
  onDeleteTodo?: (todo: Todo) => void;
  onCreateTodo?: () => void;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  showCreateButton?: boolean;
  isCompactView?: boolean;
  showCollaborationIndicators?: boolean;
  showListName?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading = false,
  error = null,
  total = 0,
  page = 1,
  totalPages = 0,
  onPageChange,
  onTodoClick,
  onToggleComplete,
  onEditTodo,
  onDeleteTodo,
  onCreateTodo,
  emptyStateTitle = "No todos found",
  emptyStateMessage = "Create your first todo to get started.",
  showCreateButton = true,
  isCompactView = false,
  showCollaborationIndicators = false,
  showListName = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange?.(value);
  };

  const handleToggleComplete = (todo: Todo) => {
    // Toggle between completed and not_started status
    const newStatus = todo.status === TodoStatus.COMPLETED 
      ? TodoStatus.NOT_STARTED 
      : TodoStatus.COMPLETED;
    
    onToggleComplete?.({
      ...todo,
      status: newStatus
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (todos.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={300}
        textAlign="center"
        py={4}
      >
        <Typography variant="h5" gutterBottom color="text.secondary">
          {emptyStateTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3} maxWidth={400}>
          {emptyStateMessage}
        </Typography>
        {showCreateButton && onCreateTodo && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateTodo}
            size="large"
          >
            Create Todo
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box position="relative">
      {isCompactView ? (
        // Compact List View
        <Box>
          {todos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onClick={onTodoClick}
              onToggleComplete={handleToggleComplete}
              onEdit={onEditTodo}
              onDelete={onDeleteTodo}
              showCollaborationIndicators={showCollaborationIndicators}
              showListName={showListName}
            />
          ))}
        </Box>
      ) : (
        // Card View
        <Stack spacing={2}>
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onClick={onTodoClick}
              onToggleComplete={handleToggleComplete}
              onEdit={onEditTodo}
              onDelete={onDeleteTodo}
            />
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Stack spacing={2} alignItems="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "large"}
            />
            <Typography variant="caption" color="text.secondary">
              Showing {todos.length} of {total} todos
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Floating Action Button for mobile */}
      {showCreateButton && onCreateTodo && isMobile && (
        <Fab
          color="primary"
          aria-label="create todo"
          onClick={onCreateTodo}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default TodoList;