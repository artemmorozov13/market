import { FC, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
  Box,
} from '@mui/material';
import { ProductType } from '..';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import styles from './ProductCard.module.scss';
import clsx from 'clsx';
import { ConfirmRemoveFromBasketModal, basketStore } from '@/entities/Basket';
import { observer } from 'mobx-react-lite';
import { ProductModal } from '@/features/ProductModal';

interface ProductCardProps {
  product: ProductType;
  isInBasket?: boolean;
  onAddItemBasket: (product: ProductType) => Promise<void>;
  onRemoveBasketItem: (product: ProductType) => Promise<void>;
}

const MINIMUM_QUANTITY_TO_BE_IN_BASKET = 1;

export const ProductCard: FC<ProductCardProps> = observer((props) => {
  const { product, isInBasket = false, onAddItemBasket, onRemoveBasketItem } = props;

  const { basketList, increaseProductCount, decreaseProductCount } = basketStore;

  const [isOpenProduct, setIsOpenProduct] = useState(false)
  const [isLoadingAdd, setIsLoadingAdd] = useState<boolean>(false);
  const [isLoadingRemove, setIsLoadingRemove] = useState<boolean>(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);

  const basketItemIndex = basketList.findIndex((item) => item.productId === product.id);
  const basketItem = basketList[basketItemIndex];

  const discountPercentage = parseFloat(product.discount);
  const originalPrice = parseFloat(product.price);
  const discountedPrice = discountPercentage > 0 
    ? originalPrice * (1 - discountPercentage / 100) 
    : originalPrice;

  const totalPrice = basketItem 
    ? Math.ceil(basketItem.quantity * discountedPrice * 100) / 100 
    : 0;

  const handlePlusProduct = async () => {
    setIsLoadingAdd(true);
    await increaseProductCount(product.id);
    setIsLoadingAdd(false);
  };

  const handleMinusProduct = async () => {
    setIsLoadingRemove(true);
    if (basketItemIndex < 0) return;

    if (basketItem.quantity === MINIMUM_QUANTITY_TO_BE_IN_BASKET) {
      setIsRemoveModalOpen(true);
      setIsLoadingRemove(false);
      return;
    }
    await decreaseProductCount(basketList[basketItemIndex].productId);
    setIsLoadingRemove(false);
  };

  const handleToggleBasketStatus = async () => {
    if (isInBasket) {
      setIsLoadingRemove(true);
      await onRemoveBasketItem(product);
      setIsLoadingRemove(false);
    } else {
      setIsLoadingAdd(true);
      await onAddItemBasket(product);
      setIsLoadingAdd(false);
    }
  };

  return (
    <>
      <ConfirmRemoveFromBasketModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        basketProduct={basketItem}
      />
      <ProductModal
        open={isOpenProduct}
        onClose={() => setIsOpenProduct(false)}
        product={product}
      />
      <Card className={styles.productCard}>
        <Box className={styles.imageContainer}>
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            className={styles.image}
            onClick={() => setIsOpenProduct(true)}
          />
          {discountPercentage > 0 && (
            <Box className={styles.discountBadge}>
              -{discountPercentage}%
            </Box>
          )}
        </Box>
        
        <CardContent className={styles.content}>
          <Box className={styles.infoSection}>
            <Typography variant="h6" className={styles.name} noWrap>
              {product.name}
            </Typography>
            <Typography variant="body2" className={styles.description}>
              {product.description}
            </Typography>
            
            <Box className={styles.priceSection}>
              <Box className={styles.priceRow}>
                <Typography className={clsx(styles.price, styles.text)}>
                  {`${discountedPrice}₽`}
                </Typography>
                {discountPercentage > 0 && (
                  <Typography className={clsx(styles.originalPrice, styles.text)}>
                    {originalPrice}&nbsp;₽
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" className={styles.unit}>
                {`${product.unitValue}${product.unitOfMeasurement}`}
              </Typography>
            </Box>
          </Box>

          {isInBasket ? (
            <Box className={styles.basketControls}>
              <Box className={styles.quantityControls}>
                <Tooltip title="Уменьшить количество">
                  <IconButton
                    size="small"
                    onClick={handleMinusProduct}
                    disabled={isLoadingRemove}
                    className={styles.quantityButton}
                  >
                    {isLoadingRemove ? <CircularProgress size={20} /> : <RemoveCircleOutlineIcon />}
                  </IconButton>
                </Tooltip>
                <Typography className={styles.quantityValue}>
                  {basketItem.quantity}
                </Typography>
                <Tooltip title="Увеличить количество">
                  <IconButton
                    size="small"
                    onClick={handlePlusProduct}
                    disabled={isLoadingAdd}
                    className={styles.quantityButton}
                  >
                    {isLoadingAdd ? <CircularProgress size={20} /> : <AddCircleOutlineIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography className={styles.totalPrice}>
                {`${totalPrice}₽`}
              </Typography>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="medium"
              onClick={handleToggleBasketStatus}
              disabled={isLoadingAdd || isLoadingRemove}
              fullWidth
              startIcon={isLoadingAdd || isLoadingRemove ? <CircularProgress size={16} /> : null}
            >
              {isLoadingAdd || isLoadingRemove ? "" : "Добавить"}
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
});