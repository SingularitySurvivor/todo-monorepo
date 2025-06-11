import React from 'react';
import { TodoListWithPermissions } from '@todo-app/client-common';
import ListDialog from './ListDialog';

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
  return (
    <ListDialog
      open={open}
      list={list || undefined}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default EditListDialog;