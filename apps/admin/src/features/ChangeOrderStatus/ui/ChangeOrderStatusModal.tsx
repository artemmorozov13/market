import { FC } from 'react'
import clsx from 'clsx'
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { OrderStatusEnum } from '@core/enums/order-status-enum'
import { ChangeStatusFormValues, changeStatusSchema } from '../lib/schema'
import { STATUS_OPTIONS } from '../lib/constants'
import styles from './ChangeOrderStatusModal.module.scss'

interface ChangeOrderStatusModalProps {
  open: boolean
  selectedCount: number
  onClose: () => void
  onSubmit: (values: ChangeStatusFormValues) => void
}

export const ChangeOrderStatusModal: FC<ChangeOrderStatusModalProps> = (props) => {
  const { open, selectedCount, onClose, onSubmit } = props

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeStatusFormValues>({
    resolver: yupResolver(changeStatusSchema) as any,
    defaultValues: {
      status: null,
      cancelReason: '',
    },
  })

  const selectedStatus = watch('status')
  const showReasonField = selectedStatus === OrderStatusEnum.CancelByAdmin

  const submitForm = (data: ChangeStatusFormValues) => {
    if (data.status) {
      onSubmit({
        status: data.status,
        cancelReason: data.cancelReason,
      })
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} BackdropProps={{ className: styles.modalBackdrop }}>
      <Box className={styles.modalContent} component="form" onSubmit={handleSubmit(submitForm)}>
        <Box className={styles.modalHeader}>
          <Typography variant="h6">Изменение статуса заказов</Typography>
          <Typography className={styles.selectedCount}>
            Выбрано заказов: <strong>{selectedCount}</strong>
          </Typography>
        </Box>

        <Box className={styles.modalForm}>
          <Controller
            name="status"
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value}
                onChange={onChange}
                select
                fullWidth
                label="Новый статус"
                error={!!errors.status}
                helperText={errors.status?.message}
                variant="outlined"
                size="medium"
                FormHelperTextProps={{
                  className: styles.modalError,
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.label} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Box
            className={clsx(styles.modalReasonField, {
              [styles.visible]: showReasonField,
              [styles.hidden]: !showReasonField,
            })}
          >
            <Controller
              name="cancelReason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Причина отмены"
                  placeholder="Опишите подробно причину отмены заказов..."
                  error={!!errors.cancelReason}
                  helperText={errors.cancelReason?.message}
                  variant="outlined"
                  size="medium"
                  FormHelperTextProps={{
                    className: styles.modalError,
                  }}
                />
              )}
            />
          </Box>
        </Box>

        <Box className={styles.modalActions}>
          <Button
            onClick={handleClose}
            className={styles.modalCancelButton}
            disabled={isSubmitting}
          >
            Отменить
          </Button>
          <Button
            type="submit"
            className={styles.modalSubmitButton}
            disabled={isSubmitting}
            endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSubmitting ? 'Сохранение...' : 'Подтвердить'}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
