import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Stack,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Schedule,
  Flag,
} from '@mui/icons-material';
import { Todo, TodoStatus, TodoPriority } from '../../types/todo';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete?: (todo: Todo) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todo: Todo) => void;
  onClick?: (todo: Todo) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
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

  const handleCardClick = () => {
    onClick?.(todo);
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case TodoPriority.HIGH:
        return 'error';
      case TodoPriority.MEDIUM:
        return 'warning';
      case TodoPriority.LOW:
        return 'success';
      default:
        return 'default';
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
    
    return {
      formatted: date.toLocaleDateString(),
      isOverdue,
    };
  };

  const isCompleted = todo.status === TodoStatus.COMPLETED;
  const dueDateInfo = todo.dueDate ? formatDueDate(todo.dueDate) : null;

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-1px)',
          boxShadow: 2,
        } : {},
        opacity: isCompleted ? 0.8 : 1,
        borderLeft: `4px solid ${getPriorityColor(todo.priority) === 'error' ? '#f44336' : 
                                 getPriorityColor(todo.priority) === 'warning' ? '#ff9800' : 
                                 getPriorityColor(todo.priority) === 'success' ? '#4caf50' : '#e0e0e0'}`,
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Checkbox
            checked={isCompleted}
            onChange={handleToggleComplete}
            color="primary"
            sx={{ p: 0, mt: 0.5 }}
          />
          
          <Box flex={1} minWidth={0}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'text.secondary' : 'text.primary',
                  wordBreak: 'break-word',
                }}
              >
                {todo.name}
              </Typography>
              
              {(onEdit || onDelete) && (
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  aria-label="todo options"
                >
                  <MoreVert />
                </IconButton>
              )}
            </Box>

            {todo.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {todo.description}
              </Typography>
            )}

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                label={todo.status.replace('_', ' ')}
                size="small"
                color={getStatusColor(todo.status)}
                variant="outlined"
              />
              
              <Chip
                label={todo.priority}
                size="small"
                color={getPriorityColor(todo.priority)}
                variant="filled"
                icon={<Flag />}
              />

              {dueDateInfo && (
                <Chip
                  label={dueDateInfo.formatted}
                  size="small"
                  color={dueDateInfo.isOverdue ? 'error' : 'default'}
                  variant="outlined"
                  icon={<Schedule />}
                />
              )}
            </Stack>

            {(todo.tags?.length || 0) > 0 && (
              <Box mt={1}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {(todo.tags || []).slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                  {(todo.tags?.length || 0) > 3 && (
                    <Chip
                      label={`+${(todo.tags?.length || 0) - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {onEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Todo</ListItemText>
          </MenuItem>
        )}
        
        {onDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Todo</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default TodoCard;