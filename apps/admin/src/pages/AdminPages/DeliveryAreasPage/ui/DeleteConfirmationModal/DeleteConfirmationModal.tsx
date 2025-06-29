import { FC } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  isDeleting
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>Подтверждение удаления</DialogTitle>
      <DialogContent>
        <Typography>Вы уверены, что хотите удалить этот пункт выдачи?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} /> : null}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};