import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { ListRole, ListFilters } from '../../types/todoList';
import ConnectionStatus from '../common/ConnectionStatus';

interface ListHeaderProps {
  title?: string;
  subtitle?: string;
  totalCount?: number;
  connectionStatus?: any;
  searchQuery?: string;
  filters?: ListFilters;
  onSearchChange?: (query: string) => void;
  onFiltersChange?: (filters: ListFilters) => void;
  onClearFilters?: () => void;
  onCreateList?: () => void;
  showCreateButton?: boolean;
  showFilters?: boolean;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  title = "Todo Lists",
  subtitle = "Organize and collaborate on your tasks",
  totalCount,
  connectionStatus,
  searchQuery = '',
  filters = {},
  onSearchChange,
  onFiltersChange,
  onClearFilters,
  onCreateList,
  showCreateButton = true,
  showFilters = true,
}) => {
  const [showFilterControls, setShowFilterControls] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };


  const handleRoleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onFiltersChange?.({
      ...filters,
      role: value === 'all' ? undefined : value as ListRole,
    });
  };

  const handleArchivedChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onFiltersChange?.({
      ...filters,
      archived: value === 'all' ? undefined : value === 'true',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.role) count++;
    if (filters.archived !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box mb={4}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4">
              {title}
            </Typography>
            {connectionStatus && (
              <ConnectionStatus status={connectionStatus} />
            )}
            {totalCount !== undefined && (
              <Chip
                label={totalCount}
                size="small"
                sx={{ fontSize: '0.875rem' }}
              />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        
        {showCreateButton && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateList}
            size="large"
          >
            Create List
          </Button>
        )}
      </Box>

      {/* Search and Filter Controls */}
      {(onSearchChange || showFilters) && (
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            {/* Search */}
            {onSearchChange && (
              <TextField
                placeholder="Search lists..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
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
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>My Role</InputLabel>
                  <Select
                    value={filters.role || 'all'}
                    onChange={handleRoleChange}
                    label="My Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value={ListRole.OWNER}>Owner</MenuItem>
                    <MenuItem value={ListRole.EDITOR}>Editor</MenuItem>
                    <MenuItem value={ListRole.VIEWER}>Viewer</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.archived === undefined ? 'all' : filters.archived.toString()}
                    onChange={handleArchivedChange}
                    label="Status"
                  >
                    <MenuItem value="all">All Lists</MenuItem>
                    <MenuItem value="false">Active</MenuItem>
                    <MenuItem value="true">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ListHeader;