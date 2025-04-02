import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Divider,
  Chip,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './ProductModal.module.scss';
import { ProductType } from '@/entities/Product';
import { Lightbox } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductType | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, product }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  if (!product) return null;

  // Разбиваем описание на строки для отображения списком
  const descriptionLines = product.description.split('\n').filter(line => line.trim() !== '');

  const originalPrice = parseFloat(product.price);
  const discount = parseFloat(product.discount);
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? originalPrice * (1 - discount / 100) : originalPrice;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      classes={{ paper: styles.modalPaper }}
    >
      <DialogTitle className={styles.modalTitle}>
        <Typography variant="h6" component="div">
          {product.name}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {isLightboxOpen && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={[{ src: product.image, alt: product.name }]}
          render={{
            buttonPrev: () => null,
            buttonNext: () => null,
          }}
        />
      )}

      <DialogContent dividers className={styles.modalContent}>
        <Box className={styles.productContainer}>
          <Box className={styles.imageContainer}>
            <img 
              src={product.image} 
              alt={product.name} 
              className={styles.productImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/path/to/default/image.jpg';
              }}
              onClick={() => setIsLightboxOpen(true)}
            />
          </Box>

          <Box className={styles.detailsContainer}>
            <Box className={styles.priceSection}>
              {hasDiscount && (
                <>
                  <Typography variant="h5" className={styles.finalPrice}>
                    {finalPrice.toFixed(2)} ₽
                  </Typography>
                  <Box className={styles.originalPriceContainer}>
                    <Typography variant="body1" className={styles.originalPrice}>
                      {originalPrice.toFixed(2)} ₽
                    </Typography>
                    <Chip 
                      label={`-${discount}%`} 
                      color="error" 
                      size="small"
                      className={styles.discountChip}
                    />
                  </Box>
                </>
              )}
              {!hasDiscount && (
                <Typography variant="h5" className={styles.finalPrice}>
                  {originalPrice.toFixed(2)} ₽
                </Typography>
              )}
            </Box>

            <Typography variant="body2" className={styles.unitInfo}>
              {product.unitValue} {product.unitOfMeasurement}
            </Typography>

            <Divider className={styles.divider} />

            <Box className={styles.descriptionSection}>
              <Typography variant="subtitle1" gutterBottom>
                Описание:
              </Typography>
              {descriptionLines.length > 0 ? (
                <div className={styles.descriptionList}>
                  {descriptionLines.map((line, index) => (
                    <Typography key={index} variant="body2">{line}</Typography>
                  ))}
                </div>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Нет описания
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className={styles.modalActions}>
        <Button 
          onClick={onClose} 
          color="primary"
          variant="contained"
          fullWidth
          className={styles.closeButtonAction}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;
