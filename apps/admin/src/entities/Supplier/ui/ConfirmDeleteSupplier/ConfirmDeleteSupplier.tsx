import { StoreUserBaseType } from '@core/types/store-user'
import { useDeleteSupplier } from '../../api/deleteSupplier'
import { Box, Button, Modal, Typography } from '@mui/material'
import { FC } from 'react'
import styles from './ConfirmDeleteSupplier.module.scss'

interface ConfirmDeleteSupplierProps {
  isOpen: boolean
  onClose: () => void
  supplier: StoreUserBaseType
}

export const ConfirmDeleteSupplier: FC<ConfirmDeleteSupplierProps> = (props) => {
  const { isOpen, supplier, onClose } = props

  const { deleteSupplier, isPending } = useDeleteSupplier()

  const handleConfirmDelete = () => {
    deleteSupplier(supplier.id)
    onClose() // Закрываем модалку после удаления
  }

  return (
    <Modal open={isOpen} onClose={onClose} className={styles.modal}>
      <Box className={styles.modalContent}>
        <Typography variant="h6" component="h2" className={styles.title}>
          Подтвердите удаление
        </Typography>
        <Typography className={styles.message}>
          Вы уверены, что хотите удалить поставщика {supplier.email}?
        </Typography>
        <Box className={styles.actions}>
          <Button variant="outlined" onClick={onClose} className={styles.cancelButton}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isPending}
            className={styles.deleteButton}
          >
            {isPending ? 'Удаление...' : 'Удалить'}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
