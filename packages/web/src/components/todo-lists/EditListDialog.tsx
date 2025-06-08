import React, { useState, useEffect } from 'react';
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
  Grid,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { UpdateTodoListRequest, TodoListWithPermissions } from '../../types/todoList';
import { todoListAPI } from '../../utils/apiClient';

interface EditListDialogProps {
  open: boolean;
  list: TodoListWithPermissions | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditListDialog: React.FC<EditListDialogProps> = ({
  open,
  list,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateTodoListRequest>({
    name: '',
    description: '',
    color: '#1976d2',
    icon: '📝',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Initialize form data when list changes
  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name,
        description: list.description || '',
        color: list.color || '#1976d2',
        icon: list.icon || '📝',
      });
    }
  }, [list]);

  const colorOptions = [
    { value: '#1976d2', label: 'Blue' },
    { value: '#388e3c', label: 'Green' },
    { value: '#f57c00', label: 'Orange' },
    { value: '#d32f2f', label: 'Red' },
    { value: '#7b1fa2', label: 'Purple' },
    { value: '#303f9f', label: 'Indigo' },
    { value: '#0288d1', label: 'Light Blue' },
    { value: '#5d4037', label: 'Brown' },
  ];

  const iconOptions = [
    { value: '📝', label: 'Memo' },
    { value: '✅', label: 'Checkmark' },
    { value: '📋', label: 'Clipboard' },
    { value: '🎯', label: 'Target' },
    { value: '📌', label: 'Pin' },
    { value: '🚀', label: 'Rocket' },
    { value: '💼', label: 'Briefcase' },
    { value: '🏠', label: 'Home' },
    { value: '💡', label: 'Idea' },
    { value: '🎨', label: 'Art' },
  ];

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'List name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'List name must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClose = () => {
    setFormErrors({});
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!list || !validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await todoListAPI.updateList(list.id, formData);
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to update todo list');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateTodoListRequest, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
          <Typography variant="h6">Edit Todo List</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="List Name"
                fullWidth
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                autoFocus
                placeholder="e.g., Weekly Tasks, Project Alpha"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="Brief description of what this list is for..."
              />
            </Grid>


            <Grid size={6}>
              <Typography variant="subtitle2" gutterBottom>
                Color Theme (Optional)
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {colorOptions.map((color) => (
                  <Box
                    key={color.value}
                    onClick={() => handleInputChange('color', color.value)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      backgroundColor: color.value,
                      cursor: 'pointer',
                      border: formData.color === color.value ? '3px solid' : '1px solid',
                      borderColor: formData.color === color.value ? 'primary.main' : 'grey.300',
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                    title={color.label}
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Icon (Optional)</InputLabel>
                <Select
                  value={formData.icon || ''}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  label="Icon (Optional)"
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {iconOptions.map((icon) => (
                    <MenuItem key={icon.value} value={icon.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{icon.value}</span>
                        <span>{icon.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Updating...' : 'Update List'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditListDialog;