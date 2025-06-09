import { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { ShopOwnerLayout } from '@widgets/ShopOwnerLayout';
import styles from './TelegramBroadcastPage.module.scss';
import { API } from '@shared/api/instance';

// Схема валидации
const broadcastSchema = yup.object().shape({
  message: yup.string().required('Сообщение обязательно').min(5, 'Сообщение должно содержать минимум 5 символов'),
});

type BroadcastFormData = yup.InferType<typeof broadcastSchema>;

const TelegramBroadcastPage: FC = () => {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues
  } = useForm<BroadcastFormData>({
    resolver: yupResolver(broadcastSchema),
    defaultValues: {
      message: '',
    },
  });

  // Мутация для отправки рассылки
  const broadcastMutation = useMutation({
    mutationFn: async (data: BroadcastFormData) => {
      const response = await API.post('/telegram/broadcast', {
        message: data.message
      });
      return response.data
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: BroadcastFormData) => {
    setOpenConfirmDialog(true);
  };

  const handleConfirm = () => {
    setOpenConfirmDialog(false);
    broadcastMutation.mutate(getValues());
  };

  const handleCancel = () => {
    setOpenConfirmDialog(false);
  };

  return (
    <ShopOwnerLayout>
      <Box className={styles.formContainer}>
        <Typography variant="h4" gutterBottom>
          Рассылка Telegram сообщений
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Этот функционал позволяет отправить сообщение всем пользователям, подключившим Telegram бота.
          </Typography>
          <Typography variant="body2">
            Сообщение будет доставлено всем пользователям, которые авторизовались через Telegram.
          </Typography>
        </Alert>

        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Внимание!
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Сообщение получат все пользователи, отменить рассылку после отправки невозможно
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Не отправляйте слишком часто, чтобы не вызывать раздражение у пользователей
          </Typography>
          <Typography variant="body2">
            • Проверьте текст сообщения перед отправкой на наличие ошибок
          </Typography>
        </Alert>

        {broadcastMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {broadcastMutation.error.message}
          </Alert>
        )}

        {broadcastMutation.isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Рассылка успешно отправлена!
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Сообщение для рассылки"
                multiline
                rows={15}
                fullWidth
                variant="outlined"
                error={!!errors.message}
                helperText={errors.message?.message}
                className={styles.messageField}
                placeholder="Введите текст сообщения для рассылки..."
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={broadcastMutation.isPending}
            className={styles.submitButton}
            fullWidth
            sx={{ mt: 2 }}
          >
            {broadcastMutation.isPending ? <CircularProgress size={24} /> : 'Отправить рассылку'}
          </Button>
        </form>

        <Dialog open={openConfirmDialog} onClose={handleCancel}>
          <DialogTitle>Подтверждение рассылки</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите отправить это сообщение всем пользователям? Это действие нельзя отменить.
            </DialogContentText>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Сообщение будет отправлено всем пользователям, подключившим Telegram бота.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="primary">
              Отмена
            </Button>
            <Button onClick={handleConfirm} color="primary" autoFocus>
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ShopOwnerLayout>
  );
};

export default TelegramBroadcastPage;