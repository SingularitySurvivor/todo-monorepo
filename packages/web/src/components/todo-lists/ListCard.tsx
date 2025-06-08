import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  People,
  Lock,
} from '@mui/icons-material';
import { TodoListWithPermissions, ListRole } from '../../types/todoList';

interface ListCardProps {
  list: TodoListWithPermissions;
  onEdit?: (list: TodoListWithPermissions) => void;
  onDelete?: (list: TodoListWithPermissions) => void;
  onManageMembers?: (list: TodoListWithPermissions) => void;
  onClick?: (list: TodoListWithPermissions) => void;
}

const ListCard: React.FC<ListCardProps> = ({
  list,
  onEdit,
  onDelete,
  onManageMembers,
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
    onEdit?.(list);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(list);
    handleMenuClose();
  };


  const handleManageMembers = () => {
    onManageMembers?.(list);
    handleMenuClose();
  };

  const handleCardClick = () => {
    onClick?.(list);
  };

  const completionPercentage = list.todoCount 
    ? Math.round(((list.completedCount || 0) / list.todoCount) * 100)
    : 0;

  const getRoleColor = (role: ListRole) => {
    switch (role) {
      case ListRole.OWNER:
        return 'primary';
      case ListRole.EDITOR:
        return 'secondary';
      case ListRole.VIEWER:
        return 'default';
      default:
        return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
        backgroundColor: list.color ? `${list.color}10` : 'background.paper',
        borderLeft: list.color ? `4px solid ${list.color}` : 'none',
        height: 200,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="flex-start" mb={2} gap={1}>
          <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
            {list.icon && (
              <Box
                sx={{
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: list.color ? `${list.color}20` : 'grey.100',
                  flexShrink: 0,
                }}
              >
                {list.icon}
              </Box>
            )}
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0
              }}
            >
              {list.name}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
            <Chip
              size="small"
              label={list.userRole}
              color={getRoleColor(list.userRole)}
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              sx={{ cursor: 'pointer' }}
            />
            {(list.canEdit || list.canDelete || list.canManageMembers) && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                aria-label="list options"
              >
                <MoreVert />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 2, minHeight: 40 }}>
          {list.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {list.description}
            </Typography>
          )}
        </Box>


        {list.todoCount && list.todoCount > 0 && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {completionPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: list.color || 'primary.main',
                },
              }}
            />
          </Box>
        )}

        <Box sx={{ mt: 'auto' }}>
          {list.members && list.members.length > 0 && (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
                {list.members.map((member, index) => (
                  <Avatar key={member.userId} sx={{ bgcolor: 'primary.main' }}>
                    {index + 1}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary">
                {list.members.length} member{list.members.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {list.canEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit List</ListItemText>
          </MenuItem>
        )}
        
        {list.canManageMembers && (
          <MenuItem onClick={handleManageMembers}>
            <ListItemIcon>
              <People fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Members</ListItemText>
          </MenuItem>
        )}
        
        
        {list.canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete List</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default ListCard;