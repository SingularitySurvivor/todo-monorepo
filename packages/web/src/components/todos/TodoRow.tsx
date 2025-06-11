import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Avatar,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Schedule,
  Flag,
} from '@mui/icons-material';
import { Todo, TodoStatus, TodoPriority, User } from '@todo-app/client-common';

interface TodoRowProps {
  todo: Todo;
  onToggleComplete?: (todo: Todo) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todo: Todo) => void;
  onClick?: (todo: Todo) => void;
  showCollaborationIndicators?: boolean;
  showListName?: boolean;
}

const TodoRow: React.FC<TodoRowProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
  showCollaborationIndicators = false,
  showListName = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit?.(todo);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(todo);
    handleMenuClose();
  };

  const handleToggleComplete = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggleComplete?.(todo);
  };

  const handleRowClick = () => {
    onClick?.(todo);
  };

  const getPriorityColor = (priority?: TodoPriority) => {
    if (!priority) return '#e0e0e0';
    switch (priority) {
      case TodoPriority.HIGH:
        return '#f44336';
      case TodoPriority.MEDIUM:
        return '#ff9800';
      case TodoPriority.LOW:
        return '#4caf50';
      default:
        return '#e0e0e0';
    }
  };

  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.COMPLETED:
        return 'success';
      case TodoStatus.IN_PROGRESS:
        return 'primary';
      case TodoStatus.NOT_STARTED:
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const isOverdue = date < now && todo.status !== TodoStatus.COMPLETED;
    
    // Show relative time for compact view
    const diffMs = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    let display = '';
    if (diffDays === 0) {
      display = 'Today';
    } else if (diffDays === 1) {
      display = date > now ? 'Tomorrow' : 'Yesterday';
    } else if (diffDays < 7) {
      display = `${diffDays}d`;
    } else {
      display = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return { display, isOverdue };
  };

  const isCompleted = todo.status === TodoStatus.COMPLETED;
  const dueDateInfo = todo.dueDate ? formatDueDate(todo.dueDate) : null;

  // Helper to get user information
  const getUserInfo = (userId: string | User): User | null => {
    if (typeof userId === 'object') {
      return userId;
    }
    return null;
  };

  // Helper to get user initials for avatar
  const getUserInitials = (user: User): string => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Helper to get user display name
  const getUserDisplayName = (user: User): string => {
    return `${user.firstName} ${user.lastName}`;
  };

  const userInfo = getUserInfo(todo.userId);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1.5,
        px: 2,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        mb: 1,
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
          transform: 'translateY(-1px)',
          boxShadow: 1,
        } : {},
        opacity: isCompleted ? 0.7 : 1,
        borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
        position: 'relative',
      }}
      onClick={handleRowClick}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onChange={handleToggleComplete}
        color="primary"
        size="small"
        sx={{ mr: 2, p: 0 }}
      />

      {/* Priority Flag */}
      <Flag
        sx={{
          color: getPriorityColor(todo.priority),
          fontSize: 16,
          mr: 1,
        }}
      />

      {/* Main Content */}
      <Box flex={1} minWidth={0} mr={2}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? 'text.secondary' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {todo.name}
          </Typography>
          
          {/* List Name */}
          {showListName && todo.listName && (
            <Chip
              label={todo.listName}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ 
                fontSize: '0.65rem', 
                height: 18,
                '& .MuiChip-label': { px: 0.5 }
              }}
            />
          )}
          
          {/* Tags */}
          {(todo.tags?.length || 0) > 0 && (
            <Stack direction="row" spacing={0.5}>
              {(todo.tags || []).slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.65rem', 
                    height: 18,
                    '& .MuiChip-label': { px: 0.5 }
                  }}
                />
              ))}
              {(todo.tags?.length || 0) > 2 && (
                <Chip
                  label={`+${(todo.tags?.length || 0) - 2}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.65rem', 
                    height: 18,
                    '& .MuiChip-label': { px: 0.5 }
                  }}
                />
              )}
            </Stack>
          )}
        </Box>

        {/* Description (if exists) */}
        {todo.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '60%',
            }}
          >
            {todo.description}
          </Typography>
        )}
      </Box>

      {/* Status Chip */}
      <Chip
        label={todo.status.replace('_', ' ')}
        size="small"
        color={getStatusColor(todo.status)}
        variant="outlined"
        sx={{ 
          fontSize: '0.7rem',
          height: 24,
          mr: 1,
          minWidth: 80,
        }}
      />

      {/* Due Date */}
      {dueDateInfo && (
        <Tooltip title={new Date(todo.dueDate!).toLocaleString()}>
          <Chip
            icon={<Schedule sx={{ fontSize: 14 }} />}
            label={dueDateInfo.display}
            size="small"
            color={dueDateInfo.isOverdue ? 'error' : 'default'}
            variant="outlined"
            sx={{ 
              fontSize: '0.7rem',
              height: 24,
              mr: 1,
              minWidth: 70,
            }}
          />
        </Tooltip>
      )}

      {/* User Avatar */}
      {userInfo && showCollaborationIndicators && (
        <Tooltip title={`Created by ${getUserDisplayName(userInfo)}`}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: '0.7rem',
              mr: 1,
              bgcolor: 'primary.main',
            }}
          >
            {getUserInitials(userInfo)}
          </Avatar>
        </Tooltip>
      )}

      {/* Actions Menu */}
      {(onEdit || onDelete) && (
        <>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label="todo options"
            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
          >
            <MoreVert fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              paper: {
                sx: { minWidth: 120 }
              }
            }}
          >
            {onEdit && (
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
            )}
            
            {onDelete && (
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      )}
    </Box>
  );
};

export default TodoRow;