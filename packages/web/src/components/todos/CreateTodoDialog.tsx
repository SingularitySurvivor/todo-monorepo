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
  Grid,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { CreateTodoRequest, TodoStatus, TodoPriority } from '../../types/todo';
import { useCreateTodo } from '../../hooks/useTodos';

interface CreateTodoDialogProps {
  open: boolean;
  listId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateTodoDialog: React.FC<CreateTodoDialogProps> = ({
  open,
  listId,
  onClose,
  onSuccess,
}) => {
  const { createTodo, loading, error } = useCreateTodo();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTodoRequest>({
    name: '',
    description: '',
    status: TodoStatus.NOT_STARTED,
    priority: TodoPriority.MEDIUM,
    tags: [],
    dueDate: '',
    listId,
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [tagInput, setTagInput] = useState('');

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Todo name is required';
    }
    
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        errors.dueDate = 'Due date must be in the future';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: TodoStatus.NOT_STARTED,
      priority: TodoPriority.MEDIUM,
      tags: [],
      dueDate: '',
      listId,
    });
    setFormErrors({});
    setSubmitError(null);
    setTagInput('');
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitError(null);
      const todoData = {
        ...formData,
        dueDate: formData.dueDate || undefined, // Convert empty string to undefined
      };
      await createTodo(todoData);
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create todo');
    }
  };

  const handleInputChange = (field: keyof CreateTodoRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
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
          <Typography variant="h6">Create New Todo</Typography>
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
                label="Todo Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                autoFocus
                placeholder="e.g., Review quarterly reports"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional description..."
              />
            </Grid>

            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as TodoStatus)}
                  label="Status"
                >
                  <MenuItem value={TodoStatus.NOT_STARTED}>Not Started</MenuItem>
                  <MenuItem value={TodoStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={TodoStatus.COMPLETED}>Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as TodoPriority)}
                  label="Priority"
                >
                  <MenuItem value={TodoPriority.LOW}>Low</MenuItem>
                  <MenuItem value={TodoPriority.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={TodoPriority.HIGH}>High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <TextField
                label="Due Date"
                type="datetime-local"
                fullWidth
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                error={!!formErrors.dueDate}
                helperText={formErrors.dueDate}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  size="small"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddTag}
                  startIcon={<Add />}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </Box>
              {(formData.tags?.length || 0) > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(formData.tags || []).map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      onDelete={() => handleRemoveTag(tag)}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
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
            {loading ? 'Creating...' : 'Create Todo'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateTodoDialog;