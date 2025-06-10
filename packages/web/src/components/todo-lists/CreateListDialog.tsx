import React from 'react';
import ListDialog from './ListDialog';

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
  return (
    <ListDialog
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default CreateListDialog;