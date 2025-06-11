import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoStatus,
  TodoPriority,
} from "@todo-app/client-common";
import { useCreateTodo } from "../../hooks/useTodos";

interface TodoDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // For create mode
  listId?: string;
  // For edit mode
  todo?: Todo;
  onSave?: (todoId: string, updates: UpdateTodoRequest) => Promise<void>;
  loading?: boolean;
}

type FormData = {
  name: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string;
};

const TodoDialog: React.FC<TodoDialogProps> = ({
  open,
  onClose,
  onSuccess,
  listId,
  todo,
  onSave,
  loading: externalLoading = false,
}) => {
  // Determine if we're in edit mode
  const isEditMode = !!todo;
  
  // For create mode, use the hook
  const createTodoHook = useCreateTodo();
  const internalLoading = createTodoHook.loading;
  const createError = createTodoHook.error;
  
  // Use external loading for edit mode, internal for create mode
  const loading = isEditMode ? externalLoading : internalLoading;
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    status: TodoStatus.NOT_STARTED,
    priority: TodoPriority.MEDIUM,
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data based on mode
  useEffect(() => {
    if (isEditMode && todo) {
      setFormData({
        name: todo.name,
        description: todo.description || "",
        status: todo.status,
        priority: todo.priority || TodoPriority.LOW,
        dueDate: todo.dueDate ? todo.dueDate.slice(0, 16) : "", // Format for datetime-local input
      });
    } else if (!isEditMode) {
      // Reset form for create mode
      setFormData({
        name: "",
        description: "",
        status: TodoStatus.NOT_STARTED,
        priority: TodoPriority.MEDIUM,
        dueDate: "",
      });
    }
  }, [todo, isEditMode, open]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Todo name is required";
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        errors.dueDate = "Due date must be in the future";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClose = () => {
    // Reset form only for create mode
    if (!isEditMode) {
      setFormData({
        name: "",
        description: "",
        status: TodoStatus.NOT_STARTED,
        priority: TodoPriority.MEDIUM,
        dueDate: "",
      });
    }
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
      
      if (isEditMode) {
        // Edit mode
        if (!todo || !onSave) {
          throw new Error("Missing todo or onSave callback for edit mode");
        }
        
        const updateData: UpdateTodoRequest = {
          ...formData,
          dueDate: formData.dueDate || undefined,
        };
        await onSave(todo.id, updateData);
      } else {
        // Create mode
        if (!listId) {
          throw new Error("Missing listId for create mode");
        }
        
        const createData: CreateTodoRequest = {
          ...formData,
          listId,
          dueDate: formData.dueDate || undefined,
        };
        await createTodoHook.createTodo(createData);
      }
      
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const action = isEditMode ? "update" : "create";
      setSubmitError(err.message || `Failed to ${action} todo`);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const displayError = isEditMode ? submitError : (createError || submitError);
  const dialogTitle = isEditMode ? "Edit Todo" : "Create New Todo";
  const submitButtonText = isEditMode 
    ? (loading ? "Saving..." : "Save Changes")
    : (loading ? "Creating..." : "Create Todo");

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{dialogTitle}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {displayError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {displayError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Todo Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
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
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Optional description..."
              />
            </Grid>

            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange("status", e.target.value as TodoStatus)
                  }
                  label="Status"
                >
                  <MenuItem value={TodoStatus.NOT_STARTED}>
                    Not Started
                  </MenuItem>
                  <MenuItem value={TodoStatus.IN_PROGRESS}>
                    In Progress
                  </MenuItem>
                  <MenuItem value={TodoStatus.COMPLETED}>Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange(
                      "priority",
                      e.target.value as TodoPriority
                    )
                  }
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
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                error={!!formErrors.dueDate}
                helperText={formErrors.dueDate}
                InputLabelProps={{
                  shrink: true,
                }}
              />
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
            {submitButtonText}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TodoDialog;