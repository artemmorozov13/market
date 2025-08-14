import { FC, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';
import styles from './ProductCard.module.scss';
import clsx from 'clsx';
import { ConfirmRemoveFromBasketModal, useBasket, usePushBasketItem, useRemoveBasketItem } from '@/entities/Basket';
import { observer } from 'mobx-react-lite';
import { ProductModal } from '@/features/ProductModal';
import { BasketTools } from '@/shared/ui/BasketTools';
import { MINIMUM_QUANTITY_TO_BE_IN_BASKET } from '@/shared/consts/applicationConsts';
import { ProductType } from '@core/types/product-item';
import { formatRubbles } from '@core/utils/formatRubbles';

interface ProductCardProps {
  product: ProductType;
  isInBasket?: boolean;
  onAddItemBasket: (product: ProductType) => void;
  onRemoveBasketItem: (product: ProductType) => void;
}

export const ProductCard: FC<ProductCardProps> = observer((props) => {
  const { product, isInBasket = false, onAddItemBasket, onRemoveBasketItem } = props;

  const { basket } = useBasket()
  const { incrementQuantity, isLoadingIncrement } = usePushBasketItem()
  const { decrementQuantity, isLoadingDecrement } = useRemoveBasketItem()

  const [isOpenProduct, setIsOpenProduct] = useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);

  const basketItemIndex = basket?.findIndex((item) => item.productId === product.id);

  // @ts-ignore
  const basketItem = basket?.[basketItemIndex];

  const discountPercentage = parseFloat(product.discount);
  const originalPrice = parseFloat(product.price.toString());
  const discountedPrice = discountPercentage > 0 
    ? originalPrice * (1 - discountPercentage / 100) 
    : originalPrice;

  const totalPrice = basketItem 
    ? Math.ceil(basketItem.quantity * discountedPrice * 100) / 100 
    : 0;

  const getDisplayUnitValue = () => {
    if (product.unitOfMeasurement === 'гр') {
      const valueInGrams = parseFloat(product.unitValue.toString());
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
    incrementQuantity(product.id)
  };

  const handleMinusProduct = async () => {
    if (typeof basketItemIndex === 'undefined') {
      return
    }
    
    if (basketItemIndex < 0) {
      return
    }

    if (basketItem.quantity === MINIMUM_QUANTITY_TO_BE_IN_BASKET) {
      setIsRemoveModalOpen(true);
      return;
    }
    if (basket?.[basketItemIndex].productId) {
      decrementQuantity(basket[basketItemIndex].productId);
    }
  };

  const handleToggleBasketStatus = async () => {
    if (isInBasket) {
      onRemoveBasketItem(product);
    } else {
      onAddItemBasket(product);
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
              -{discountPercentage.toFixed()}%
            </Box>
          )}
        </Box>
        
        <CardContent className={styles.content}>
          <div className={styles.infoSection} onClick={() => setIsOpenProduct(true)}>
            <Typography variant="body1" className={styles.name}>
              {product.name}
            </Typography>
            <Box className={styles.priceRow}>
              <Typography variant='body1' className={clsx(styles.price, styles.text)}>
                {`${formatRubbles(discountedPrice)}`}
              </Typography>
              {discountPercentage > 0 && (
                <Typography className={clsx(styles.originalPrice, styles.text)}>
                  {formatRubbles(originalPrice)}
                </Typography>
              )}
            </Box>
            <Box className={styles.priceSection}>
              <Typography variant="caption" className={styles.unit}>
                {`${displayUnitValue} ${displayUnitOfMeasurement}`}
              </Typography>
            </Box>
          </div>

          <BasketTools
            basketItem={basketItem}
            totalPrice={totalPrice}
            isInBasket={isInBasket}
            isLoadingAdd={isLoadingIncrement}
            isLoadingRemove={isLoadingDecrement}
            handleToggleBasketStatus={handleToggleBasketStatus}
            handleMinusProduct={handleMinusProduct}
            handlePlusProduct={handlePlusProduct}
          />
        </CardContent>
      </Card>
    </>
  );
});