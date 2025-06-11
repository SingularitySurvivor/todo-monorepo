import React from "react";
import { Todo, UpdateTodoRequest } from "@todo-app/client-common";
import TodoDialog from "./TodoDialog";

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
  return (
    <TodoDialog
      open={open}
      todo={todo || undefined}
      onClose={onClose}
      onSave={onSave}
      loading={loading}
    />
  );
};

export default EditTodoDialog;