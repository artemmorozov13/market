import { FC } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import styles from './ConfirmCancelOrder.module.scss';

interface ConfirmCancelOrderProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderId?: number;
}

export const ConfirmCancelOrder: FC<ConfirmCancelOrderProps> = ({ 
  open, 
  onClose, 
  onConfirm,
  orderId 
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="cancel-order-dialog-title"
      className={styles.dialog}
    >
      <DialogTitle id="cancel-order-dialog-title" className={styles.title}>
        Подтверждение отмены заказа
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText className={styles.contentText}>
          Вы действительно хотите отменить заказ {orderId && `№${orderId}`}?
        </DialogContentText>
        
        <Typography variant="body2" className={styles.warningText}>
          После отмены восстановить заказ будет невозможно
        </Typography>
      </DialogContent>
      
      <DialogActions className={styles.actions}>
        <Button 
          onClick={onClose} 
          variant="outlined"
        >
          Вернуться
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          autoFocus
        >
          Подтвердить отмену
        </Button>
      </DialogActions>
    </Dialog>
  );
};