import React, { useState } from 'react'
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
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import styles from './ProductModal.module.scss'
import { Lightbox } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { BasketTools } from '@/shared/ui/BasketTools'
import { useBasket, usePushBasketItem, useRemoveBasketItem } from '@/entities/Basket'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { ProductType } from '@core/types/product-item'
import { formatRubbles } from '@core/utils/formatRubbles'

interface ProductModalProps {
  open: boolean
  isInBasket?: boolean
  onClose: () => void
  product: ProductType | null
}

const ProductModal: React.FC<ProductModalProps> = (props) => {
  const { product, open, isInBasket = false, onClose } = props

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const { basket } = useBasket()
  const { incrementQuantity, isLoadingIncrement } = usePushBasketItem()
  const { decrementQuantity, isLoadingDecrement } = useRemoveBasketItem()
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)

  if (!product) return null

  const descriptionLines = product.description.split('\n').filter((line) => line.trim() !== '')

  const originalPrice = product.price
  const discount = parseFloat(product.discount)
  const hasDiscount = discount > 0
  const finalPrice = hasDiscount ? originalPrice * (1 - discount / 100) : originalPrice

  const basketItemIndex = basket?.findIndex((item) => item.productId === product.id) || 0
  const basketItem = basket?.at(basketItemIndex)

  const discountPercentage = parseFloat(product.discount)
  const discountedPrice =
    discountPercentage > 0 ? originalPrice * (1 - discountPercentage / 100) : originalPrice

  const totalPrice = basketItem ? Math.ceil(basketItem.quantity * discountedPrice * 100) / 100 : 0

  const handlePlusProduct = async () => {
    incrementQuantity(product.id)
  }

  const handleMinusProduct = async () => {
    if (basketItem?.productId) {
      decrementQuantity(basketItem.productId)
    }
  }

  const handleToggleBasketStatus = async () => {
    if (isInBasket) {
      decrementQuantity(product.id)
    } else {
      incrementQuantity(product.id)
    }
  }

  return (
    <>
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
          <IconButton aria-label="close" onClick={onClose} className={styles.closeButton}>
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
              <LazyLoadImage
                src={product.image}
                alt={product.name}
                className={styles.productImage}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/path/to/default/image.jpg'
                }}
                onClick={() => setIsLightboxOpen(true)}
              />
            </Box>

            <Box className={styles.detailsContainer}>
              <Box className={styles.priceSection}>
                {hasDiscount && (
                  <>
                    <Typography variant="h5" className={styles.finalPrice}>
                      {formatRubbles(finalPrice)}
                    </Typography>
                    <Box className={styles.originalPriceContainer}>
                      <Typography variant="body1" className={styles.originalPrice}>
                        {/* {originalPrice?.toFixed()} ₽ */}
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
                    {/* {originalPrice?.toFixed()} ₽ */}
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
                      <Typography key={index} variant="body2">
                        {line}
                      </Typography>
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
          <div className={styles.basketToolsWrapper}>
            {!!basketItem && (
              <BasketTools
                basketItem={basketItem}
                className={styles.addProduct}
                totalPrice={totalPrice}
                isInBasket={isInBasket}
                isLoadingAdd={isLoadingIncrement}
                isLoadingRemove={isLoadingDecrement}
                handleMinusProduct={handleMinusProduct}
                handlePlusProduct={handlePlusProduct}
                handleToggleBasketStatus={handleToggleBasketStatus}
              />
            )}
          </div>
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
    </>
  )
}

export default ProductModal
