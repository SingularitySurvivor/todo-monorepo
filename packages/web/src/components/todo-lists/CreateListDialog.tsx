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
  FormHelperText,
  Grid,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CreateTodoListRequest } from '../../types/todoList';
import { useCreateTodoList } from '../../hooks/useTodoList';

interface CreateListDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { createList, loading, error } = useCreateTodoList();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTodoListRequest>({
    name: '',
    description: '',
    color: '#1976d2', // Default to blue
    icon: '📝', // Default to memo icon
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

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
    
    if (!formData.name.trim()) {
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
    setFormData({
      name: '',
      description: '',
      color: '#1976d2', // Reset to default blue
      icon: '📝', // Reset to default memo icon
    });
    setFormErrors({});
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitError(null);
      await createList(formData);
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create todo list');
    }
  };

  const handleInputChange = (field: keyof CreateTodoListRequest, value: string | undefined) => {
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
          <Typography variant="h6">Create New Todo List</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {(error || submitError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="List Name"
                fullWidth
                value={formData.name}
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
            {loading ? 'Creating...' : 'Create List'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateListDialog;