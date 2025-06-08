import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { TodoListWithPermissions } from '../../types/todoList';
import ListCard from './ListCard';

interface ListGridProps {
  lists: TodoListWithPermissions[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onListClick?: (list: TodoListWithPermissions) => void;
  onEditList?: (list: TodoListWithPermissions) => void;
  onDeleteList?: (list: TodoListWithPermissions) => void;
  onManageMembers?: (list: TodoListWithPermissions) => void;
  onCreateList?: () => void;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  showCreateButton?: boolean;
}

const ListGrid: React.FC<ListGridProps> = ({
  lists,
  loading = false,
  error = null,
  total = 0,
  page = 1,
  totalPages = 0,
  onPageChange,
  onListClick,
  onEditList,
  onDeleteList,
  onManageMembers,
  onCreateList,
  emptyStateTitle = "No todo lists found",
  emptyStateMessage = "Create your first todo list to get started organizing your tasks.",
  showCreateButton = true,
}) => {
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange?.(value);
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

  if (lists.length === 0) {
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
        {showCreateButton && onCreateList && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateList}
            size="large"
          >
            Create Todo List
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {lists.map((list) => (
          <Grid key={list.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ListCard
              list={list}
              onClick={onListClick}
              onEdit={onEditList}
              onDelete={onDeleteList}
              onManageMembers={onManageMembers}
            />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Stack spacing={2} alignItems="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
            <Typography variant="caption" color="text.secondary">
              Showing {lists.length} of {total} lists
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ListGrid;