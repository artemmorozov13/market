import { FC } from 'react';
import styles from './CreateProductFormModal.module.scss';
import { ProductForm, ProductFormType } from '@features/PostNewProducts';
import { Box, Modal } from '@mui/material';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormType) => void
}

export const CreateProductModal: FC<CreateProductModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    onSubmit
  } = props

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box className={styles.modal}>
        <ProductForm onSubmit={onSubmit} />
      </Box>
    </Modal>
  );
};