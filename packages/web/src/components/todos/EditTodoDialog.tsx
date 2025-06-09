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
  Chip,
  Stack,
} from "@mui/material";
import { Close, Add } from "@mui/icons-material";
import {
  Todo,
  UpdateTodoRequest,
  TodoStatus,
  TodoPriority,
} from "../../types/todo";

interface EditTodoDialogProps {
  open: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSave: (todoId: string, updates: UpdateTodoRequest) => Promise<void>;
  loading?: boolean;
}

const EditTodoDialog: React.FC<EditTodoDialogProps> = ({
  open,
  todo,
  onClose,
  onSave,
  loading = false,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateTodoRequest>({
    name: "",
    description: "",
    status: TodoStatus.NOT_STARTED,
    priority: TodoPriority.MEDIUM,
    tags: [],
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState("");

  // Initialize form data when todo changes
  useEffect(() => {
    if (todo) {
      setFormData({
        name: todo.name,
        description: todo.description || "",
        status: todo.status,
        priority: todo.priority,
        tags: todo.tags || [],
        dueDate: todo.dueDate ? todo.dueDate.slice(0, 16) : "", // Format for datetime-local input
      });
    }
  }, [todo]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
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
    setFormErrors({});
    setSubmitError(null);
    setTagInput("");
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!todo || !validateForm()) {
      return;
    }

    try {
      setSubmitError(null);
      const todoData = {
        ...formData,
        dueDate: formData.dueDate || undefined,
      };
      await onSave(todo.id, todoData);
      handleClose();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to update todo");
    }
  };

  const handleInputChange = (field: keyof UpdateTodoRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !(formData.tags || []).includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  if (!todo) {
    return null;
  }

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
          <Typography variant="h6">Edit Todo</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Todo Name"
                fullWidth
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                autoFocus
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description || ""}
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
                  value={formData.status || TodoStatus.NOT_STARTED}
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
                  value={formData.priority || TodoPriority.MEDIUM}
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
                value={formData.dueDate || ""}
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
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditTodoDialog;
