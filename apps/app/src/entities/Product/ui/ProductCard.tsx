import { FC, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';
import { ProductType } from '..';
import styles from './ProductCard.module.scss';
import clsx from 'clsx';
import { ConfirmRemoveFromBasketModal, basketStore } from '@/entities/Basket';
import { observer } from 'mobx-react-lite';
import { ProductModal } from '@/features/ProductModal';
import { BasketTools } from '@/shared/ui/BasketTools';
import { MINIMUM_QUANTITY_TO_BE_IN_BASKET } from '@/shared/consts/applicationConsts';

interface ProductCardProps {
  product: ProductType;
  isInBasket?: boolean;
  onAddItemBasket: (product: ProductType) => Promise<void>;
  onRemoveBasketItem: (product: ProductType) => Promise<void>;
}

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

  const getDisplayUnitValue = () => {
    if (product.unitOfMeasurement === 'гр') {
      const valueInGrams = parseFloat(product.unitValue);
      return (valueInGrams / 1000).toString();
    }
    return product.unitValue;
  };

  const getDisplayUnitOfMeasurement = () => {
    return product.unitOfMeasurement === 'гр' ? 'кг' : product.unitOfMeasurement;
  };

  const displayUnitValue = getDisplayUnitValue();
  const displayUnitOfMeasurement = getDisplayUnitOfMeasurement();

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
        isInBasket={isInBasket}
        onAddItemBasket={onAddItemBasket}
        onRemoveBasketItem={onRemoveBasketItem}
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
          <div className={styles.infoSection} onClick={() => setIsOpenProduct(true)}>
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
                {`${displayUnitValue}${displayUnitOfMeasurement}`}
              </Typography>
            </Box>
          </div>

          <BasketTools
            basketItem={basketItem}
            totalPrice={totalPrice}
            isInBasket={isInBasket}
            isLoadingAdd={isLoadingAdd}
            isLoadingRemove={isLoadingRemove}
            handleToggleBasketStatus={handleToggleBasketStatus}
            handleMinusProduct={handleMinusProduct}
            handlePlusProduct={handlePlusProduct}
          />
        </CardContent>
      </Card>
    </>
  );
});