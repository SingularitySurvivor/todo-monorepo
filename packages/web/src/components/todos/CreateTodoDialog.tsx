import React from "react";
import TodoDialog from "./TodoDialog";

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
  return (
    <TodoDialog
      open={open}
      listId={listId}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default CreateTodoDialog;