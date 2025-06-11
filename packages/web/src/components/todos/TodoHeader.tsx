import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add,
  FilterList,
  Clear,
  Sort,
} from '@mui/icons-material';
import { TodoStatus, TodoPriority, TodoFilters } from '@todo-app/client-common';

interface TodoHeaderProps {
  title?: string;
  subtitle?: string;
  totalCount?: number;
  filters?: TodoFilters;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onFiltersChange?: (filters: TodoFilters) => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  onClearFilters?: () => void;
  onCreateTodo?: () => void;
  showCreateButton?: boolean;
  showFilters?: boolean;
  canEdit?: boolean;
}

const TodoHeader: React.FC<TodoHeaderProps> = ({
  title = "Tasks",
  subtitle,
  totalCount,
  filters = {},
  sortField = 'createdAt',
  sortOrder = 'desc',
  onFiltersChange,
  onSortChange,
  onClearFilters,
  onCreateTodo,
  showCreateButton = true,
  showFilters = true,
  canEdit = true,
}) => {
  const [showFilterControls, setShowFilterControls] = useState(false);


  const handleStatusChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onFiltersChange?.({
      ...filters,
      status: value === 'all' ? undefined : value as TodoStatus,
    });
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onFiltersChange?.({
      ...filters,
      priority: value === 'all' ? undefined : value as TodoPriority,
    });
  };

  const handleSortFieldChange = (event: SelectChangeEvent) => {
    const field = event.target.value;
    onSortChange?.(field, sortOrder);
  };

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange?.(sortField, newOrder);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box mb={3}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {title}
            {totalCount !== undefined && (
              <Chip
                label={totalCount}
                size="small"
                sx={{ ml: 2, fontSize: '0.875rem' }}
              />
            )}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {showCreateButton && canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateTodo}
            size="small"
          >
            Add Task
          </Button>
        )}
      </Box>

      {/* Filter and Sort Controls */}
      {(showFilters || onSortChange) && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={2}>

            {/* Sort */}
            {onSortChange && (
              <>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortField}
                    onChange={handleSortFieldChange}
                    label="Sort by"
                    startAdornment={<Sort sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="createdAt">Created</MenuItem>
                    <MenuItem value="updatedAt">Updated</MenuItem>
                    <MenuItem value="dueDate">Due Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSortOrderToggle}
                  sx={{ minWidth: 60 }}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </>
            )}

            {/* Filter Toggle */}
            {showFilters && (
              <Button
                variant={showFilterControls ? "contained" : "outlined"}
                startIcon={<FilterList />}
                onClick={() => setShowFilterControls(!showFilterControls)}
                size="small"
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Chip
                    label={activeFiltersCount}
                    size="small"
                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Button>
            )}

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="text"
                startIcon={<Clear />}
                onClick={onClearFilters}
                size="small"
                color="secondary"
              >
                Clear
              </Button>
            )}
          </Stack>

          {/* Filter Controls */}
          {showFilters && showFilterControls && (
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || 'all'}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value={TodoStatus.NOT_STARTED}>Not Started</MenuItem>
                    <MenuItem value={TodoStatus.IN_PROGRESS}>In Progress</MenuItem>
                    <MenuItem value={TodoStatus.COMPLETED}>Completed</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority || 'all'}
                    onChange={handlePriorityChange}
                    label="Priority"
                  >
                    <MenuItem value="all">All Priority</MenuItem>
                    <MenuItem value={TodoPriority.LOW}>Low</MenuItem>
                    <MenuItem value={TodoPriority.MEDIUM}>Medium</MenuItem>
                    <MenuItem value={TodoPriority.HIGH}>High</MenuItem>
                  </Select>
                </FormControl>

                {/* TODO: Add date range and tag filters */}
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TodoHeader;