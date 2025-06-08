import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  Person,
  Email,
  AdminPanelSettings,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { TodoListWithPermissions, ListRole, AddMemberRequest, UpdateMemberRoleRequest } from '../../types/todoList';
import { useListPermissions } from '../../hooks';

interface MembersDialogProps {
  open: boolean;
  list: TodoListWithPermissions | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const MembersDialog: React.FC<MembersDialogProps> = ({
  open,
  list,
  onClose,
  onSuccess,
}) => {
  const { addMember, updateMemberRole, removeMember, loading, error, success, clearError, clearSuccess } = useListPermissions();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<ListRole>(ListRole.EDITOR);
  const [addingMember, setAddingMember] = useState(false);

  const handleClose = () => {
    setNewMemberEmail('');
    setNewMemberRole(ListRole.EDITOR);
    setAddingMember(false);
    clearError();
    clearSuccess();
    onClose();
  };

  const handleAddMember = async () => {
    if (!list || !newMemberEmail.trim()) return;

    try {
      const memberData: AddMemberRequest = {
        email: newMemberEmail.trim(),
        role: newMemberRole,
      };
      
      await addMember(list.id, memberData);
      setNewMemberEmail('');
      setNewMemberRole(ListRole.EDITOR);
      setAddingMember(false);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: ListRole) => {
    if (!list) return;

    try {
      const updateData: UpdateMemberRoleRequest = {
        userId,
        role: newRole,
      };
      
      await updateMemberRole(list.id, updateData);
      // Call onSuccess to refresh the list data, but don't close dialog
      // The parent should refetch data to update the dialog's props
      onSuccess?.();
    } catch (err) {
      console.error('Failed to update member role:', err);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!list) return;

    if (window.confirm(`Are you sure you want to remove ${memberName} from this list?`)) {
      try {
        await removeMember(list.id, userId);
        onSuccess?.();
      } catch (err) {
        console.error('Failed to remove member:', err);
      }
    }
  };

  const getRoleIcon = (role: ListRole) => {
    switch (role) {
      case ListRole.OWNER:
        return <AdminPanelSettings color="primary" />;
      case ListRole.EDITOR:
        return <Edit color="secondary" />;
      case ListRole.VIEWER:
        return <Visibility color="action" />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role: ListRole): "primary" | "secondary" | "default" => {
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

  const getUserDisplayInfo = (member: any) => {
    // Use populated user data from backend if available, fallback to userId display
    if (member.user && (member.user.firstName || member.user.lastName || member.user.email)) {
      const fullName = [member.user.firstName, member.user.lastName].filter(Boolean).join(' ');
      const displayName = fullName || member.user.email || `User ${member.userId.slice(-6)}`;
      const initials = fullName 
        ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : member.user.email ? member.user.email.slice(0, 2).toUpperCase()
        : member.userId.slice(0, 2).toUpperCase();
      
      return {
        displayName,
        initials,
        email: member.user.email || 'Email not available'
      };
    }
    
    // Fallback for when user data is not populated
    return {
      displayName: `User ${member.userId.slice(-6)}`,
      initials: member.userId.slice(0, 2).toUpperCase(),
      email: 'Email not available'
    };
  };

  if (!list) return null;

  const canManageMembers = list.canManageMembers;
  const currentUserMember = list.members.find(m => m.userId === list.createdBy); // Simplified - should use actual current user

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Manage Members</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={clearSuccess}>
            {success}
          </Alert>
        )}

        {/* Add New Member Section */}
        {canManageMembers && (
          <>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Add /> Add New Member
              </Typography>
              
              {!addingMember ? (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setAddingMember(true)}
                  fullWidth
                >
                  Invite Member
                </Button>
              ) : (
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Enter email address"
                      autoFocus
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>
                  <Grid size={8}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as ListRole)}
                        label="Role"
                      >
                        <MenuItem value={ListRole.VIEWER}>Viewer - Can view only</MenuItem>
                        <MenuItem value={ListRole.EDITOR}>Editor - Can edit tasks</MenuItem>
                        <MenuItem value={ListRole.OWNER}>Owner - Full control</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={4}>
                    <Box display="flex" gap={1} height="100%">
                      <Button
                        variant="contained"
                        onClick={handleAddMember}
                        disabled={!newMemberEmail.trim() || loading}
                        sx={{ flex: 1 }}
                      >
                        {loading ? <CircularProgress size={20} /> : 'Add'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setAddingMember(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {/* Current Members List */}
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person /> Members ({list.members.length})
        </Typography>

        <List>
          {list.members.map((member, index) => {
            const isCurrentUser = member.userId === list.createdBy; // Simplified
            const canModify = canManageMembers && !isCurrentUser;
            const userInfo = getUserDisplayInfo(member);
            
            return (
              <ListItem key={member.userId} divider={index < list.members.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {userInfo.initials}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {userInfo.displayName}
                        {isCurrentUser && (
                          <Chip label="You" size="small" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        {getRoleIcon(member.role)}
                        <Chip
                          label={member.role}
                          size="small"
                          color={getRoleColor(member.role)}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {userInfo.email}
                      </Typography>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  {canModify && (
                    <Box display="flex" gap={1}>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.userId, e.target.value as ListRole)}
                          disabled={loading}
                        >
                          <MenuItem value={ListRole.VIEWER}>Viewer</MenuItem>
                          <MenuItem value={ListRole.EDITOR}>Editor</MenuItem>
                          <MenuItem value={ListRole.OWNER}>Owner</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <IconButton
                        onClick={() => handleRemoveMember(member.userId, userInfo.displayName)}
                        disabled={loading}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>

        {list.members.length === 0 && (
          <Box textAlign="center" py={4}>
            <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No members yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Invite team members to collaborate on this list
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MembersDialog;